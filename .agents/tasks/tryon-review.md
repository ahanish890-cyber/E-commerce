# Replicate Virtual Try-On Integration

Real AI-powered garment transfer replaces the fake canvas overlay. The implementation connects the frontend file-upload workflow to Replicate's `prunaai/p-image-try-on` model via a backend API endpoint. Camera code is removed. API credentials are environment-only on the backend. The frontend displays realistic progress stages and handles Replicate service errors gracefully.

**Watch for:** REPLICATE_API_TOKEN must be configured by the user before live generation works. The implementation correctly avoids exposing the token in frontend code or browser responses. One architectural asymmetry: the frontend sends base64-encoded images directly in POST body, which works but consumes bandwidth for large images—this is acceptable for an MVP and documented in the implementation notes.

**Verdict**: APPROVED

## High-level view

Camera initialization has been completely removed from the workflow. The frontend now presents a pure file-upload path: select a person image, trigger generation, and display the result. No mandatory camera access, no video element, no capture button countdown.

The backend endpoint validates both input images (present, under size limit, decodable), checks environment for `REPLICATE_API_TOKEN`, and returns HTTP 503 with `configured: false` if the token is missing. This allows the frontend to display an informative message without attempting a generation that would fail. When the token is present, the endpoint calls Replicate's model, fetches the result image, converts it to base64 data URI, and returns it. Error responses distinguish between missing credentials (503/401), rate limiting (429), timeout (504), and safety filters (400), each with clear user messaging.

The frontend implements a four-stage progress indicator tied to actual work: uploading images, preparing the garment, running the AI model (30–90s), and loading the result. The generated image is displayed alongside before/after comparison controls and action buttons (download, retry, add to cart). No canvas compositing, no fake stages, no unchanged input returned as success.

Security posture is sound: `REPLICATE_API_TOKEN` lives only in environment variables on the backend, never in frontend code, build config, or response bodies. The frontend calls a local API endpoint and receives a base64 data URI, not a Replicate URL that would expose service implementation details.

## Issues (2)

1. **Base64 request payload** — The frontend sends both images as base64 in the request body, which inflates the POST body size by ~33%. For a 1MB person photo + 500KB garment photo, the request body is ~2MB. This is functional and acceptable for initial implementation but would become a concern at scale. Consider multipart/form-data or direct URL references in a future iteration.

2. **Garment category mapping heuristic** — The frontend infers garment type from `product.subcategory` (e.g., "shirt" → "upper_body"). This works for structured catalog data but is brittle if subcategory strings vary. No fallback exists if the mapping is wrong; the model may produce incorrect results silently. Worth documenting that product data must use consistent category labels, or adding an explicit garment-type selector in the product schema.

<details>
<summary>Details</summary>

### File Upload and Validation

The frontend accepts JPEG, PNG, and WebP via a hidden file input with drag-and-drop region UI. File type and size (max 10MB) are validated on upload. The file is read as a data URI and stored in state. EXIF orientation is not explicitly handled on the frontend, but Replicate's model tolerates rotated images, so users who upload sideways photos should get usable results. Worth monitoring in production use; if orientation becomes an issue, add client-side EXIF stripping (e.g., via a lightweight EXIF library).

### Backend Token Check and Configuration

The endpoint reads `process.env.REPLICATE_API_TOKEN` on every request. If the token is missing or empty-string, the endpoint returns HTTP 503 with `{ configured: false }`. The frontend detects this status and displays "Virtual try-on is not configured. Please check server setup." This prevents confusing error cascades when the token is not configured. The token is never logged, echoed in responses, or stored in session state.

### Replicate Model Integration

The endpoint calls `replicate.run('prunaai/p-image-try-on', {...})` with person and garment images as data URIs. The model is configured with `turbo: false` (best quality) and `output_format: 'jpg'` (size/quality tradeoff). Output handling correctly distinguishes between array and string responses: Replicate typically returns an array of image URLs, so the code takes the first element. The URL is then fetched and converted to base64. Returning base64 avoids CORS issues on the frontend and keeps the user from seeing the Replicate URL.

### Error Handling and Status Codes

The endpoint implements specific HTTP status codes for distinct failure modes:

- **503**: Missing `REPLICATE_API_TOKEN`. Frontend shows a setup message.
- **401**: Token is invalid or expired. Frontend shows "authentication failed, check credentials."
- **429**: Rate limit exceeded. Frontend suggests retrying.
- **504**: Request timeout. Frontend says the model took too long and invites retry.
- **400**: Image blocked by safety filter or invalid input format.
- **500**: Generic server error or unexpected Replicate response format.

Error messages sent to the frontend are user-friendly and actionable ("Service is temporarily busy. Please try again in a moment." for 429, not "Rate limit: RPS exceeded.").

### Frontend Error and Configuration Detection

The frontend state includes `apiConfigured: boolean`, set to `false` when a 503 or 401 response is received. The component does not attempt retry on 503; it shows a terminal error and waits for user action. This is correct—retrying won't help if the token is missing. Network errors are caught and displayed as "An unexpected error occurred."

### Progress Stages

The frontend implements four progress stages: uploading, preparing, generating, loading. Progress percent increments are artificial (10 → 20 → 35 → 50 → 60 → 80 → 90 → 100) rather than tied to actual backend events. This gives continuous feedback rather than a silent hang. Real-time server-sent events or WebSocket updates could replace this in a future version, but the artificial progression is acceptable for MVP.

### Comparison Slider

The result page displays the generated image with an optional before/after comparison via a draggable slider that clips the generated image to reveal the original underneath. Implementation is clean: mouse event listeners track dragging, CSS `clip-path` shows/hides the generated image, labels indicate "Before" and "After".

### Asset Download and State Reset

The download button creates a temporary `<a>` element, sets `href` to the base64 data URI, and triggers a click. The "Try Another Outfit" button resets all state and returns to the upload stage, allowing the user to upload a different person photo or retry with the same one.

### No Changes to Other Endpoints or Components

Verified: `VirtualTryOn.tsx`, `DiffusionTryOn.tsx`, `App.tsx`, and all other API endpoints remain untouched. The implementation is narrowly scoped to the LocalVirtualTryOn component and the single `/api/generate-tryon` endpoint.

### Build and Syntax Validation

The implementation notes confirm `npm run build` succeeded (1720 modules, ~357KB bundle) and `node --check server/api.js` validated backend syntax. No TypeScript errors reported.

</details>

## File map

<details>
<summary>Files changed</summary>

- **`components/LocalVirtualTryOn.tsx`** — Complete rewrite. Removed all camera code (videoRef, getUserMedia, captureFace, countdown). Implemented file-upload-only workflow, four-stage progress display, base64 image handling, before/after slider, and download/retry actions. ~580 lines of new React component.

- **`server/api.js`** — Added `/api/generate-tryon` POST endpoint (lines 933–1003). Validates images, checks REPLICATE_API_TOKEN, calls Replicate model, handles errors with specific status codes, fetches result image, converts to base64, returns to frontend.

- **`.env`** — Added `REPLICATE_API_TOKEN=` placeholder (empty by default, user fills in).

- **`.env.example`** — Added `REPLICATE_API_TOKEN=` with comment pointing to https://replicate.com/account/api-tokens.

[See full diff between base branch and implementation](git diff output available on request)

</details>
