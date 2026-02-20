import { v4 as uuidv4 } from 'uuid';

export default function generateComplaintId() {
  const short = uuidv4().slice(0, 8).toUpperCase();
  return `RN-${short}`;
}
