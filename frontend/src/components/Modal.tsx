import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/modal.css";

interface ModalProps {
  open: boolean;
  title?: string;
  dismissible?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, title, dismissible = true, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, dismissible, onClose]);

  if (!open) {
    return null;
  }

  const content = (
    <div className="modal-overlay" onClick={dismissible ? onClose : undefined}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h3>{title || "提示"}</h3>
          {dismissible && (
            <button type="button" className="modal__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          )}
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Modal;
