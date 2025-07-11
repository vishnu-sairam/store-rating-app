import { ClipLoader } from 'react-spinners';

export default function Spinner({ size = 40, color = '#7c3aed', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ClipLoader size={size} color={color} speedMultiplier={0.8} />
    </div>
  );
} 