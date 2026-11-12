"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { playModalClose, playModalOpen } from "@/lib/sound";
import { getLenis } from "./SmoothScroll";
import { ContactForm } from "./ContactForm";

type Ctx = { open: () => void };
const ContactContext = createContext<Ctx>({ open: () => {} });
export const useContact = () => useContext(ContactContext);

export function ContactProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    dialog.current?.showModal();
    getLenis()?.stop();
    playModalOpen();
  }, []);
  const close = useCallback(() => dialog.current?.close(), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <ContactContext.Provider value={value}>
      {children}
      <dialog
        ref={dialog}
        className="contact-modal"
        aria-labelledby="contact-modal-title"
        onClose={() => {
          getLenis()?.start();
          playModalClose();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        data-lenis-prevent=""
      >
        <div className="contact-modal-inner">
          <div className="contact-modal-head">
            <h2 id="contact-modal-title">Send an enquiry</h2>
            <button type="button" className="pill" onClick={close}>
              Close
            </button>
          </div>
          <ContactForm />
        </div>
      </dialog>
    </ContactContext.Provider>
  );
}
