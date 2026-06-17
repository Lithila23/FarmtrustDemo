import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PortalMenu = ({ anchorEl, onClose, children, offset = 8, className = '' }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, visibility: 'hidden' });

  useEffect(() => {
    if (!anchorEl) return;

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect();
      const menu = menuRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let left = rect.left;
      let top = rect.bottom + offset;

      if (menu) {
        const mw = menu.offsetWidth;
        const mh = menu.offsetHeight;
        if (left + mw + 8 > viewportW) {
          left = Math.max(8, viewportW - mw - 8);
        }
        if (top + mh + 8 > viewportH) {
          // open above the anchor if not enough space below
          top = rect.top - mh - offset;
        }
      }

      setPos({ left, top, visibility: 'visible' });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorEl, offset]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!anchorEl) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className={`fixed z-50 ${className}`}
        style={{ left: pos.left, top: pos.top, visibility: pos.visibility }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

export default PortalMenu;
