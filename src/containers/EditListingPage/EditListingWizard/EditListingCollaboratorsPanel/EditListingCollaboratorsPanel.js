import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { apiBaseUrl } from '../../../../util/api';
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import css from './EditListingCollaboratorsPanel.module.css';

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const fetchCollaborators = useCallback(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);

    fetch(`${apiBaseUrl()}/api/listing-collaborators/${listingId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch collaborators.');
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAdd = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !listingId) return;

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (collaborators.includes(trimmed)) {
      setError('This collaborator has already been added.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    fetch(`${apiBaseUrl()}/api/listing-collaborators`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId: trimmed }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add collaborator.');
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
        setEmail('');
        setSuccess(`${trimmed} added as collaborator.`);
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleRemove = collaboratorEmail => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    fetch(`${apiBaseUrl()}/api/listing-collaborators`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId: collaboratorEmail }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to remove collaborator.');
        return res.json();
      })
      .then(json => {
        setCollaborators(json.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
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
      {success ? <p className={css.success}>{success}</p> : null}

      <div className={css.addForm}>
        <label className={css.label} htmlFor="collaboratorEmail">
          Invite by email
        </label>
        <div className={css.inputRow}>
          <input
            id="collaboratorEmail"
            className={css.input}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            disabled={disabled || loading}
          />
          <button
            type="button"
            className={css.addButton}
            onClick={handleAdd}
            disabled={disabled || loading || !email.trim()}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {collaborators.length > 0 ? (
        <div className={css.collaboratorSection}>
          <label className={css.sectionLabel}>
            Team members ({collaborators.length})
          </label>
          <ul className={css.collaboratorList}>
            {collaborators.map(collab => (
              <li key={collab} className={css.collaboratorItem}>
                <div className={css.collaboratorInfo}>
                  <span className={css.avatar}>
                    {collab.charAt(0).toUpperCase()}
                  </span>
                  <span className={css.collaboratorEmail}>{collab}</span>
                </div>
                <button
                  type="button"
                  className={css.removeButton}
                  onClick={() => handleRemove(collab)}
                  disabled={disabled || loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : !loading ? (
        <p className={css.emptyState}>
          No team members yet. Add collaborators by email to let them help manage this listing.
        </p>
      ) : null}
    </main>
  );
};

export default EditListingCollaboratorsPanel;
