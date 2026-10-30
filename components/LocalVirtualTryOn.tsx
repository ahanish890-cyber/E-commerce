import React from 'react';
import { Product } from '../types';
import { VirtualTryOnModal } from './VirtualTryOnModal';

export interface LocalVirtualTryOnProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

/**
 * LocalVirtualTryOn wrapper component
 * Provides backwards compatibility with existing App imports while delegating to
 * the fully functional presentation-ready VirtualTryOnModal.
 */
export const LocalVirtualTryOn: React.FC<LocalVirtualTryOnProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  return (
    <VirtualTryOnModal
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
};

export default LocalVirtualTryOn;
