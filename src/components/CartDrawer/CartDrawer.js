import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { useConfiguration } from '../../context/configurationContext';
import {
  selectCartItems,
  selectCartIsOpen,
  selectCartByProvider,
  selectCartItemCount,
  removeFromCart,
  updateQuantity,
  setDrawerOpen,
} from '../../ducks/cart.duck';

import { NamedLink, IconClose } from '../../components';

import css from './CartDrawer.module.css';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className={css.cartItem}>
      <div className={css.itemInfo}>
        <div className={css.itemTitle}>{item.title}</div>
        <div className={css.itemPrice}>
          {item.price ? `$${(item.price.amount / 100).toFixed(2)}` : ''}
        </div>
      </div>
      <div className={css.itemActions}>
        <select
          className={css.quantitySelect}
          value={item.quantity}
          onChange={e => onUpdateQuantity(item.listingId, parseInt(e.target.value, 10))}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          className={css.removeButton}
          onClick={() => onRemove(item.listingId)}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const CartDrawer = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCartIsOpen);
  const cartByProvider = useSelector(selectCartByProvider);
  const itemCount = useSelector(selectCartItemCount);

  const handleClose = () => dispatch(setDrawerOpen(false));
  const handleRemove = listingId => dispatch(removeFromCart({ listingId }));
  const handleUpdateQuantity = (listingId, quantity) =>
    dispatch(updateQuantity({ listingId, quantity }));

  if (!isOpen) return null;

  return (
    <>
      <div className={css.overlay} onClick={handleClose} />
      <div className={css.drawer}>
        <div className={css.header}>
          <h3 className={css.headerTitle}>Cart ({itemCount})</h3>
          <button className={css.closeButton} onClick={handleClose} type="button">
            <IconClose rootClassName={css.closeIcon} />
          </button>
        </div>

        <div className={css.content}>
          {cartByProvider.length === 0 ? (
            <div className={css.emptyCart}>Your cart is empty</div>
          ) : (
            cartByProvider.map(group => (
              <div key={group.providerId} className={css.providerGroup}>
                <div className={css.providerName}>{group.providerName || 'Lender'}</div>
                {group.items.map(item => (
                  <CartItem
                    key={item.listingId}
                    item={item}
                    onRemove={handleRemove}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {itemCount > 0 && (
          <div className={css.footer}>
            <NamedLink name="CartPage" className={css.checkoutButton} onClick={handleClose}>
              View Cart & Checkout
            </NamedLink>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
