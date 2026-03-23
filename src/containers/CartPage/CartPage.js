import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { useIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import {
  selectCartItems,
  selectCartByProvider,
  selectCartItemCount,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../../ducks/cart.duck';

import {
  H3,
  LayoutSingleColumn,
  NamedLink,
  Page,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import css from './CartPage.module.css';

const CartPage = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const dispatch = useDispatch();

  const cartByProvider = useSelector(selectCartByProvider);
  const itemCount = useSelector(selectCartItemCount);
  const cartTotal = useSelector(selectCartTotal);
  const scrollingDisabled = useSelector(state => isScrollingDisabled(state));

  const handleRemove = listingId => dispatch(removeFromCart({ listingId }));
  const handleUpdateQuantity = (listingId, quantity) =>
    dispatch(updateQuantity({ listingId, quantity }));
  const handleClearCart = () => dispatch(clearCart());

  const title = 'Shopping Cart';

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headerRow}>
            <H3 as="h1" className={css.heading}>
              {title} ({itemCount})
            </H3>
            {itemCount > 0 && (
              <button className={css.clearButton} onClick={handleClearCart} type="button">
                Clear Cart
              </button>
            )}
          </div>

          {cartByProvider.length === 0 ? (
            <div className={css.emptyCart}>
              <p>Your cart is empty.</p>
              <NamedLink name="SearchPage" className={css.browseLink}>
                Browse listings
              </NamedLink>
            </div>
          ) : (
            <div className={css.cartContent}>
              {cartByProvider.map(group => (
                <div key={group.providerId} className={css.providerGroup}>
                  <div className={css.providerHeader}>
                    <span className={css.providerName}>
                      From: {group.providerName || 'Lender'}
                    </span>
                  </div>

                  {group.items.map(item => (
                    <div key={item.listingId} className={css.cartItem}>
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
                          onChange={e =>
                            handleUpdateQuantity(item.listingId, parseInt(e.target.value, 10))
                          }
                        >
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <button
                          className={css.removeButton}
                          onClick={() => handleRemove(item.listingId)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className={css.summary}>
                <div className={css.totalRow}>
                  <span>Estimated Total</span>
                  <span className={css.totalAmount}>${(cartTotal / 100).toFixed(2)}</span>
                </div>
                <p className={css.shippingNote}>
                  Shipping calculated at checkout. Each lender ships separately.
                </p>
                <NamedLink name="CartCheckoutPage" className={css.checkoutButton}>
                  Proceed to Checkout
                </NamedLink>
              </div>
            </div>
          )}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default CartPage;
