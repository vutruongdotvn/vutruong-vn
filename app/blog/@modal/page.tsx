// Giữ một page thật ở gốc slot để Next.js resolve metadata ổn định hơn khi
// chuyển mềm vào intercepted route. UI mặc định của slot vẫn là rỗng.
export default function ModalSlotPage() {
  return null;
}
