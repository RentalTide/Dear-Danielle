import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { NamedLink } from '../../components';
import css from './FavoriteButton.module.css';

/**
 * FavoriteButton - Heart icon for toggling listing favorites.
 *
 * @component
 * @param {Object} props
 * @param {string} props.listingId - Listing UUID string
 * @param {boolean} props.isFavorited - Whether the listing is currently favorited
 * @param {Function} props.onToggle - Called with listingId when clicked
 * @param {boolean} props.isAuthenticated - Whether the user is logged in
 * @param {string?} props.className - Optional additional CSS class
 */
const FavoriteButton = props => {
  const { listingId, isFavorited, onToggle, isAuthenticated, className } = props;
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = e => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowPopover(prev => !prev);
      return;
    }

    if (onToggle) {
      onToggle(listingId);
    }
  };

  const classes = classNames(css.root, className, {
    [css.favorited]: isFavorited,
  });

  return (
    <div className={css.wrapper}>
      <button ref={buttonRef} className={classes} onClick={handleClick} type="button" aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
        <svg
          className={css.heartIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      {showPopover && (
        <div ref={popoverRef} className={css.popover} onClick={e => e.stopPropagation()}>
          <p className={css.popoverText}>Love this piece? Favorite it by logging in!</p>
          <NamedLink name="LoginPage" className={css.popoverLink}>
            Log in
          </NamedLink>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;
