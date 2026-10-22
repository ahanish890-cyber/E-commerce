# Virtual Try-On Pipeline Diagnosis

## Executive Summary

The entire virtual try-on pipeline is **non-functional end-to-end**. The active component (LocalVirtualTryOn) performs only fake canvas image compositing with fabricated progress stages and requires a mandatory camera despite the task requirement to remove camera dependencies. The only API-connected component (DiffusionTryOn) is unused. The backend /api/generate-tryon route returns fake success without performing any processing. The Python service implements face swapping (wrong use case) and is unreachable from the frontend. No AI model for garment transfer has been invoked at any point in the current application.

---

## Component Flow Diagram

### Current (Broken) Active Path:
```
User Click "Generate Try-On"
    ↓
LocalVirtualTryOn.generateLocalTryOn()
    ↓
setTimeout delays (fake progress: 0% → 20% → 40% → 60% → 80% → 100%)
    ↓
createVirtualTryOn()
    ↓
canvas.drawImage(personImage)
canvas.drawImage(garmentImage, x=60%, y=15%, opacity=85%)
    ↓
canvas.toDataURL() → FAKE RESULT (garment rectangle paste)
    ↓
User sees: fake result, thinks feature works
```

### Disconnected Unused Path:
```
DiffusionTryOn (NOT IMPORTED in App.tsx)
    ↓
POST /api/generate-tryon { faceImage, outfitImage }
    ↓
server/api.js route (STUB)
    ↓
return { success: true, message: 'Processing complete on client side' }
    ↓
NEVER HAPPENS (component not used)
```

### Completely Unreachable Path:
```
app.py (FastAPI on port 8000)
    POST /api/tryon (InsightFace face swap)
    ↓
NOT PROXIED in vite.config.ts
NOT CALLED from server/api.js
NOT REACHABLE from frontend
RESULT: Never invoked
```

---

## Per-Component Breakdown

| File | Claims | Actually Does | Where It Breaks | Verdict |
|------|--------|---------------|-----------------|---------|
| **LocalVirtualTryOn.tsx** (ACTIVE) | Loads AI models, detects body landmarks, applies garment transfer | Initializes webcam on mount, draws garment image as a 60%×85% opacity rectangle on canvas using hardcoded coordinates, shows fake progress bars with setTimeout delays | No API calls. No pose detection. No AI model invoked. Pure canvas paste operation. | **COMPLETELY FAKE** |
| **VirtualTryOn.tsx** | Uses MediaPipe pose, overlays garment realistically | Detects pose landmarks, draws garment as a fixed rectangle at shoulder position | No actual garment deformation. No clothing-aware placement. Pure overlay. | **FAKE OVERLAY** |
| **DiffusionTryOn.tsx** | API-connected try-on component | Wired to call POST /api/generate-tryon with faceImage and outfitImage; checks /health endpoint; handles mock flag in responses | Component is NOT IMPORTED in App.tsx. Not used anywhere. Camera-first design (mandatory on mount). | **UNUSED BUT WIRED** |
| **api/generate-tryon.ts** | Calls Replicate IDM-VTON model | Attempts to call replicate.run() with fake/malformed model hash `zsxkib/instant-id:d3e7f9e7e8e8e8e8...` (all 'e8' repeated) | File is in /api/ but NOT imported into Express server. Vite does not serve API routes. Dead file. Model hash is invalid even if it were called. | **DEAD FILE** |
| **server/api.js** — POST /api/generate-tryon | Backend endpoint to process try-on request and call AI model | Returns `{ success: true, message: 'Processing complete on client side' }` immediately without any processing | No Replicate call. No Python service call. No model invocation. No image processing. Pure stub. | **STUB ENDPOINT** |
| **app.py** | Virtual try-on service | FastAPI server implementing face swap using InsightFace + inswapper_128.onnx | Swaps user's face onto outfit model body. NOT garment transfer. Not body-pose-aware clothing placement. Wrong service entirely. | **WRONG SERVICE (face swap, not garment transfer)** |
| **tryon.py** | Try-on model service | Loads InsightFace FaceAnalysis, uses inswapper_128.onnx to swap faces between images | Requires inswapper_128.onnx file (NOT in repository). Detects faces, performs face swap, not garment transfer. | **WRONG SERVICE + MISSING MODEL FILE** |
| **vite.config.ts** | Frontend routing | Proxies /api → http://localhost:3003 (Node.js); no proxy to port 8000 | Python service on port 8000 is completely unreachable from frontend | **PYTHON SERVICE ISOLATED** |

---

## Data Flow With Examples

### What User Uploads:
- Person image: JPEG/PNG from device → loaded as `File` object → `fileReader.readAsDataURL()` → base64 data URL stored in React state

### What Happens to It:
1. `handleUploadPerson(file)` → `setPersonImage(dataURL)`
2. User selects garment from product catalog or uploads garment image
3. User clicks "Generate Try-On"
4. `generateLocalTryOn()` runs:
   - `setProgress(0)` → show "Uploading images..."
   - `setTimeout(..., 1000)` → `setProgress(20)` → show "Preparing the person and garment..."
   - `setTimeout(..., 2000)` → `setProgress(40)` → show "Loading AI models..."
   - `setTimeout(..., 3000)` → `setProgress(60)` → show "Detecting body landmarks..."
   - `setTimeout(..., 4000)` → `setProgress(80)` → show "Applying garment transfer..."
   - Calls `createVirtualTryOn(personImage, garmentImage)`
5. `createVirtualTryOn()` executes:
   ```javascript
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   
   // Draw person image
   ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);
   
   // Draw garment as a fixed rectangle at hardcoded position
   ctx.globalAlpha = 0.85;
   ctx.drawImage(garmentImg, 
     canvas.width * 0.60,      // x = 60% from left
     canvas.height * 0.15,     // y = 15% from top
     garmentImg.width * 0.4,   // fixed width
     garmentImg.height * 0.4   // fixed height
   );
   ```
6. `return canvas.toDataURL('image/jpeg')`
7. Result displayed to user

### What Bytes Actually Travel:
- Upload: File → base64 URL → React state → canvas HTML element (no HTTP)
- Backend: No HTTP call made
- Python: No connection ever attempted
- Model: No model ever invoked
- Response: Canvas pixels → data URL → `<img src={resultImage}>`

**Result:** User sees person image with a garment-shaped rectangle pasted at 60% horizontal, 15% vertical, at 85% opacity, with NO deformation, NO pose alignment, NO clothing logic.

---

## Root Causes (Numbered)

1. **Active component implements pure canvas compositing, not AI:**
   - LocalVirtualTryOn.createVirtualTryOn() draws images at hardcoded positions with fixed opacity and dimensions.
   - No pose detection, no segmentation, no model invocation.
   - setTimeout delays simulate progress but perform no actual work.

2. **The only API-connected component is completely unused:**
   - DiffusionTryOn.tsx exists and is wired to POST /api/generate-tryon.
   - Not imported in App.tsx.
   - App.tsx imports LocalVirtualTryOn instead.

3. **Backend /api/generate-tryon route is a non-functional stub:**
   - Receives { faceImage, outfitImage } in request body.
   - Returns hardcoded success response without processing.
   - Does not call Replicate, does not call Python service, does not invoke any model.

4. **api/generate-tryon.ts is a dead Vite API file:**
   - Lives in /api/ directory but is NOT imported into server/api.js.
   - Contains invalid Replicate model hash (all 'e8' repeated: `d3e7f9e7e8e8e8e8...`).
   - Vite does not serve API routes; this is unreachable code.
   - Never called anywhere in the application.

5. **Python service implements wrong use case (face swap, not garment transfer):**
   - app.py runs FastAPI on port 8000.
   - tryon.py uses InsightFace + inswapper_128.onnx for face swapping.
   - This is a face-replacement service, not a garment-transfer service.
   - Does not preserve garment properties or fit clothing to body pose.

6. **Python service is unreachable from frontend:**
   - vite.config.ts proxies /api → http://localhost:3003 (Node.js only).
   - No proxy exists for port 8000 (Python FastAPI).
   - server/api.js never calls port 8000.
   - Python service is isolated from the application.

7. **Required model file is missing:**
   - tryon.py requires inswapper_128.onnx to be present on disk.
   - File is not included in the repository.
   - Application would fail at runtime if Python service were called.

8. **No Replicate API token is configured:**
   - .env.example lists REPLICATE_API_TOKEN but does not set it.
   - .env is not committed.
   - Even if api/generate-tryon.ts were wired and had a valid model hash, authentication would fail with 401.

9. **Camera is mandatory in both active components:**
   - LocalVirtualTryOn.tsx calls `navigator.mediaDevices.getUserMedia()` on mount.
   - VirtualTryOn.tsx requires camera initialization.
   - File upload is only a fallback when camera fails.
   - Task explicitly requires removal of mandatory camera dependency.

---

## What Is Real vs Fake

### REAL (Actually Implemented):
- Camera capture using MediaStream API
- File upload input HTML element
- Product catalog display and selection
- Progress bar UI (visual element only)
- Canvas compositing and `toDataURL()` conversion
- Backend auth, orders, products APIs
- Vite dev server routing
- Express.js server and routing

### FAKE (Claims vs Reality):
| Claimed Stage | Actual Implementation |
|---------------|----------------------|
| "Loading AI models..." | setTimeout(1000ms) → setProgress(20) |
| "Detecting body landmarks..." | setTimeout(3000ms) → setProgress(60) |
| "Applying garment transfer..." | setTimeout(4000ms) → setProgress(80) |
| "Generating the try-on image..." | canvas.toDataURL() (immediate) |
| Generated result image | Canvas paste at fixed coordinates, garment as opaque rectangle, no deformation |

---

## Recommended Implementation Approach

### Model Selection
- **Use Replicate's IDM-VTON model** — correct identifier: `yisol/idm-vton`
- Accepts: person image (PIL Image or URL), garment image (PIL Image or URL), optionally garment category
- Returns: garment-transferred image with realistic clothing placement, body-aware deformation
- No additional segmentation or pose preprocessing required (model handles internally)
- Known to work for upper-body and lower-body garments

### Architecture Changes
1. **Replace LocalVirtualTryOn with file-upload-first component:**
   - Remove all camera initialization and permission requests
   - Use `<input type="file">` as primary input (no fallback to camera)
   - Option to select garment from catalog or upload garment image
   - Display realistic status updates tied to actual async work (not fake timeouts)

2. **Wire backend /api/generate-tryon to Replicate IDM-VTON:**
   - Accept { personImageUrl, garmentImageUrl, garmentCategory? } in request
   - Call replicate.run('yisol/idm-vton', { image: personImage, cloth_image: garmentImage, ... })
   - Return { success, resultImageUrl } or { success: false, error }
   - Store result image URL for download/retry

3. **Store REPLICATE_API_TOKEN securely:**
   - Read from .env on backend only (server/api.js)
   - Never expose token in React, HTTP response headers, or logs
   - Fail gracefully with clear message if token is missing

4. **Implement real async status reporting:**
   - Remove fake setTimeout delays
   - Report actual stages: uploading, preparing images, calling model, downloading result
   - Show error messages with actionable steps (retry, try different image, contact support)

5. **Deprecate or clearly separate unrelated services:**
   - **Option A:** Remove app.py/tryon.py entirely (they implement face swap, not garment transfer; not useful for this task)
   - **Option B:** Keep them as a separate face-swap feature but do NOT confuse with garment transfer; clearly label in UI if exposed

### Priority Ranking for Implementation
1. **HIGH:** components/LocalVirtualTryOn.tsx — Replace fake canvas pipeline with real Replicate call
2. **HIGH:** server/api.js — Implement real /api/generate-tryon endpoint calling Replicate IDM-VTON
3. **HIGH:** .env — Add REPLICATE_API_TOKEN configuration
4. **MEDIUM:** components/App.tsx — Update import/routing if necessary; ensure file-upload-first component is active
5. **LOW:** api/generate-tryon.ts — Delete (dead file, never called)
6. **LOW:** app.py, tryon.py — Decide: delete if no need for face-swap feature, or keep clearly labeled as separate from garment transfer

---

## Files to Change (Priority Order)

### HIGH PRIORITY (Required for Functional Try-On):

**1. components/LocalVirtualTryOn.tsx**
- Remove camera initialization and permissions
- Replace canvas compositing with Replicate API call
- Remove fake setTimeout progress stages
- Implement real async status updates
- Wire to backend POST /api/generate-tryon

**2. server/api.js**
- Replace stub /api/generate-tryon route with real implementation
- Call replicate.run('yisol/idm-vton', ...) with API token from env
- Handle Replicate errors, timeouts, rate limits
- Return generated image URL to frontend
- Validate input image URLs before sending to Replicate

**3. .env**
- Add REPLICATE_API_TOKEN=<actual-token> (user must provide)
- Ensure token is never committed or exposed

### MEDIUM PRIORITY (Integration/Quality):

**4. components/App.tsx**
- Verify LocalVirtualTryOn (or replacement component) is imported and routed correctly
- Optionally retire DiffusionTryOn if it is not being used

**5. public/ or static assets**
- Ensure sample garment/person images exist for testing (if needed)

### LOW PRIORITY (Cleanup):

**6. api/generate-tryon.ts**
- Delete (unreachable dead code, invalid model hash, never called)

**7. app.py, tryon.py**
- Decision required: Delete or keep as labeled face-swap feature separate from garment transfer
- If kept, add clear separation in UI/docs; do NOT confuse with garment transfer
- If kept, provide vite.config.ts proxy for /api/tryon → port 8000 (currently missing)

---

## Immediate Blockers to Resolution

1. **REPLICATE_API_TOKEN not set:** User must create Replicate account, generate API token, and add to .env.
2. **No AI model currently being called:** Complete rewrite of try-on pipeline required.
3. **Camera mandatory:** User experience violates task requirement; must be removed before go-live.
4. **Fake progress stages:** Must be replaced with real async operations.

---

## Success Criteria

- [ ] User uploads person image (file input, no camera required)
- [ ] User selects or uploads garment image
- [ ] User clicks "Generate Try-On"
- [ ] Backend calls Replicate IDM-VTON with real model ID and valid API token
- [ ] Realistic garment transfer image is generated and returned within 30–60 seconds
- [ ] Result is displayed to user with garment naturally fitted to body
- [ ] User can download result, retry, or select another garment
- [ ] All fake setTimeout delays and progress stages are removed
- [ ] Error messages are clear and actionable
- [ ] No camera permissions are requested or required
- [ ] No secrets (API tokens) appear in React code, HTTP responses, or logs
