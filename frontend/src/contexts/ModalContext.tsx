import React, { createContext, useContext, useState } from "react";
import Modal from "../components/Modal";

interface ModalOptions {
  title?: string;
  content: React.ReactNode;
  dismissible?: boolean;
}

interface ModalContextValue {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const defaultState = {
  open: false,
  title: "",
  content: null as React.ReactNode,
  dismissible: true,
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(defaultState);

  const openModal = (options: ModalOptions) => {
    setState({ open: true, title: options.title || "提示", content: options.content, dismissible: options.dismissible ?? true });
  };

  const closeModal = () => {
    if (!state.dismissible) return;
    setState(defaultState);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal open={state.open} title={state.title} dismissible={state.dismissible} onClose={closeModal}>
        {state.content}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return ctx;
};
