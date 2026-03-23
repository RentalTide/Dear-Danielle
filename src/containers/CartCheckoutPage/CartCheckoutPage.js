import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { useIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { selectCartByProvider, selectCartItemCount, clearCart } from '../../ducks/cart.duck';

import {
  H3,
  LayoutSingleColumn,
  NamedLink,
  Page,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import css from './CartCheckoutPage.module.css';

/**
 * CartCheckoutPage orchestrates multiple Sharetribe transactions,
 * one per provider group. Each transaction goes through the standard
 * payment flow (initiateOrder → confirmPayment).
 *
 * For the MVP, this page shows the cart summary grouped by provider
 * and initiates checkout per provider. Full multi-transaction orchestration
 * will be wired once the Stripe payment flow is integrated.
 */
const CartCheckoutPage = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const dispatch = useDispatch();

  const cartByProvider = useSelector(selectCartByProvider);
  const itemCount = useSelector(selectCartItemCount);
  const scrollingDisabled = useSelector(state => isScrollingDisabled(state));

  const [checkoutState, setCheckoutState] = useState('idle'); // idle | processing | complete | error
  const [currentGroup, setCurrentGroup] = useState(0);
  const [completedOrders, setCompletedOrders] = useState([]);

  const title = 'Checkout';

  if (itemCount === 0 && checkoutState !== 'complete') {
    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn
          topbar={<TopbarContainer />}
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            <div className={css.emptyCart}>
              <p>Your cart is empty.</p>
              <NamedLink name="SearchPage" className={css.browseLink}>
                Browse listings
              </NamedLink>
            </div>
          </div>
        </LayoutSingleColumn>
      </Page>
    );
  }

  if (checkoutState === 'complete') {
    return (
      <Page title="Order Complete" scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn
          topbar={<TopbarContainer />}
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            <div className={css.successMessage}>
              <H3 as="h1">Orders Placed Successfully!</H3>
              <p>
                {completedOrders.length} order{completedOrders.length !== 1 ? 's' : ''} placed
                with {completedOrders.length} lender{completedOrders.length !== 1 ? 's' : ''}.
              </p>
              <p className={css.note}>
                Each lender will ship their items separately. You'll receive
                confirmation emails for each order.
              </p>
              <NamedLink name="InboxPage" params={{ tab: 'orders' }} className={css.viewOrdersButton}>
                View My Orders
              </NamedLink>
            </div>
          </div>
        </LayoutSingleColumn>
      </Page>
    );
  }

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <H3 as="h1" className={css.heading}>
            Checkout
          </H3>

          <p className={css.description}>
            Your order will be split into {cartByProvider.length} separate transaction
            {cartByProvider.length !== 1 ? 's' : ''}, one per lender.
          </p>

          {checkoutState === 'processing' && (
            <div className={css.processingBanner}>
              Processing order {currentGroup + 1} of {cartByProvider.length}...
            </div>
          )}

          {cartByProvider.map((group, index) => (
            <div
              key={group.providerId}
              className={css.providerGroup}
            >
              <div className={css.providerHeader}>
                <span className={css.providerName}>
                  Order {index + 1}: {group.providerName || 'Lender'}
                </span>
                <span className={css.itemCount}>
                  {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {group.items.map(item => (
                <div key={item.listingId} className={css.cartItem}>
                  <span className={css.itemTitle}>{item.title}</span>
                  <span className={css.itemPrice}>
                    {item.price ? `$${(item.price.amount / 100).toFixed(2)}` : ''}
                    {item.quantity > 1 ? ` x${item.quantity}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <div className={css.checkoutActions}>
            <p className={css.shippingNote}>
              Shipping details and payment will be collected for each order.
              Card holds may apply depending on lender settings.
            </p>
            {/*
              MVP: Individual checkout links per provider group.
              Each links to the standard CheckoutPage for that listing.
              Full orchestrated multi-checkout will be implemented in Phase 2.
            */}
            <NamedLink name="SearchPage" className={css.continueButton}>
              Continue Shopping
            </NamedLink>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default CartCheckoutPage;
