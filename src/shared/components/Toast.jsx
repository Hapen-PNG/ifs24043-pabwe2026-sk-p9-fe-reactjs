export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{message}</span>
      <button className="toast-close" type="button" aria-label="Tutup notifikasi" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
