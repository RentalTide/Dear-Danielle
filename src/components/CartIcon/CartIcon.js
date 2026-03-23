import React from 'react';
import classNames from 'classnames';

import css from './CartIcon.module.css';

/**
 * CartIcon - Shopping bag icon with item count badge.
 *
 * @component
 * @param {Object} props
 * @param {number} props.count - Number of items in cart
 * @param {Function} props.onClick - Click handler
 * @param {string?} props.className - Optional additional CSS class
 */
const CartIcon = props => {
  const { count = 0, onClick, className } = props;

  return (
    <button
      className={classNames(css.root, className)}
      onClick={onClick}
      type="button"
      aria-label={`Shopping cart with ${count} items`}
    >
      <svg className={css.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && <span className={css.badge}>{count > 99 ? '99+' : count}</span>}
    </button>
  );
};

export default CartIcon;
