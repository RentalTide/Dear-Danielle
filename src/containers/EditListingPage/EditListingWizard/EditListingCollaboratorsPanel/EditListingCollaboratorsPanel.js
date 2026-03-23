import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import css from './EditListingCollaboratorsPanel.module.css';

/**
 * EditListingCollaboratorsPanel allows the listing owner to manage
 * collaborator user IDs stored in the listing's privateData.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.rootClassName]
 * @param {propTypes.ownListing} props.listing
 * @param {boolean} props.disabled
 * @param {boolean} props.ready
 * @param {Function} props.onSubmit
 * @param {string} props.submitButtonText
 * @param {boolean} props.panelUpdated
 * @param {boolean} props.updateInProgress
 * @param {Object} props.errors
 * @param {Object} props.intl
 * @returns {JSX.Element}
 */
const EditListingCollaboratorsPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    updatePageTitle: UpdatePageTitle,
    intl,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const listingId = listing?.id?.uuid;

  const [collaborators, setCollaborators] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingCollaboratorsPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingCollaboratorsPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  // Fetch collaborators on mount and when listingId changes
  const fetchCollaborators = useCallback(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/listing-collaborators/${listingId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch collaborators.');
        }
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
      })
      .catch(e => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [listingId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAddCollaborator = () => {
    const trimmedId = newUserId.trim();
    if (!trimmedId || !listingId) return;

    setLoading(true);
    setError(null);

    fetch('/api/listing-collaborators', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId: trimmedId }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to add collaborator.');
        }
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
        setNewUserId('');
      })
      .catch(e => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRemoveCollaborator = userId => {
    if (!listingId) return;

    setLoading(true);
    setError(null);

    fetch('/api/listing-collaborators', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to remove collaborator.');
        }
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
      })
      .catch(e => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>

      {error ? <p className={css.error}>{error}</p> : null}

      {loading && collaborators.length === 0 ? (
        <p className={css.loading}>
          <FormattedMessage id="EditListingCollaboratorsPanel.loading" />
        </p>
      ) : null}

      {!loading && collaborators.length === 0 ? (
        <p className={css.emptyState}>
          <FormattedMessage id="EditListingCollaboratorsPanel.noCollaborators" />
        </p>
      ) : null}

      {collaborators.length > 0 ? (
        <ul className={css.collaboratorList}>
          {collaborators.map(userId => (
            <li key={userId} className={css.collaboratorItem}>
              <span className={css.collaboratorId}>{userId}</span>
              <button
                type="button"
                className={css.removeButton}
                onClick={() => handleRemoveCollaborator(userId)}
                disabled={disabled || loading}
              >
                <FormattedMessage id="EditListingCollaboratorsPanel.removeButton" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={css.addForm}>
        <div className={css.inputWrapper}>
          <label className={css.label} htmlFor="collaboratorUserId">
            <FormattedMessage id="EditListingCollaboratorsPanel.userIdLabel" />
          </label>
          <input
            id="collaboratorUserId"
            className={css.input}
            type="text"
            value={newUserId}
            onChange={e => setNewUserId(e.target.value)}
            placeholder={intl.formatMessage({
              id: 'EditListingCollaboratorsPanel.userIdPlaceholder',
            })}
            disabled={disabled || loading}
          />
        </div>
        <button
          type="button"
          className={css.addButton}
          onClick={handleAddCollaborator}
          disabled={disabled || loading || !newUserId.trim()}
        >
          <FormattedMessage id="EditListingCollaboratorsPanel.addButton" />
        </button>
      </div>
    </main>
  );
};

export default EditListingCollaboratorsPanel;
