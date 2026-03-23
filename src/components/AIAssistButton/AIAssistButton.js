import React, { useState } from 'react';
import classNames from 'classnames';

import { IconSpinner } from '../../components';

import css from './AIAssistButton.module.css';

const SparkleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

/**
 * AIAssistButton - A button that calls the AI listing assist endpoint
 * to generate suggestions for listing descriptions, size, color, occasions, and category.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className - Additional CSS class
 * @param {string[]?} props.imageUrls - Array of listing image URLs to analyze
 * @param {string?} props.category - Current listing category
 * @param {string?} props.title - Current listing title
 * @param {Function} props.onApply - Callback receiving suggestions object when user clicks "Apply All"
 * @returns {JSX.Element}
 */
const AIAssistButton = props => {
  const { className, imageUrls, category, title, onApply } = props;
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    fetch('/api/ai-listing-assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrls: imageUrls || [],
        category: category || undefined,
        title: title || undefined,
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to get AI suggestions');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuggestions(data);
        }
      })
      .catch(e => {
        setError(e.message || 'Something went wrong. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleApplyAll = () => {
    if (suggestions && onApply) {
      onApply(suggestions);
      setSuggestions(null);
    }
  };

  const handleDismiss = () => {
    setSuggestions(null);
    setError(null);
  };

  const rootClasses = classNames(css.root, className);

  return (
    <div className={rootClasses}>
      <button
        type="button"
        className={loading ? css.buttonLoading : css.button}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <>
            <IconSpinner rootClassName={css.spinner} />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <SparkleIcon className={css.sparkleIcon} />
            <span>AI Assist</span>
          </>
        )}
      </button>

      {error ? <p className={css.errorText}>{error}</p> : null}

      {suggestions ? (
        <div className={css.suggestionsPanel}>
          <div className={css.suggestionsHeader}>
            <h4 className={css.suggestionsTitle}>AI Suggestions</h4>
            <div>
              <button type="button" className={css.applyAllButton} onClick={handleApplyAll}>
                Apply All
              </button>
              <button type="button" className={css.dismissButton} onClick={handleDismiss}>
                &times;
              </button>
            </div>
          </div>

          {suggestions.description ? (
            <div className={css.suggestionItem}>
              <p className={css.suggestionLabel}>Description</p>
              <p className={css.descriptionPreview}>{suggestions.description}</p>
            </div>
          ) : null}

          {suggestions.suggestedSize ? (
            <div className={css.suggestionItem}>
              <p className={css.suggestionLabel}>Size</p>
              <p className={css.suggestionValue}>{suggestions.suggestedSize.toUpperCase()}</p>
            </div>
          ) : null}

          {suggestions.suggestedColor ? (
            <div className={css.suggestionItem}>
              <p className={css.suggestionLabel}>Color</p>
              <p className={css.suggestionValue}>
                {suggestions.suggestedColor.charAt(0).toUpperCase() +
                  suggestions.suggestedColor.slice(1)}
              </p>
            </div>
          ) : null}

          {suggestions.suggestedOccasions && suggestions.suggestedOccasions.length > 0 ? (
            <div className={css.suggestionItem}>
              <p className={css.suggestionLabel}>Occasions</p>
              <ul className={css.tagList}>
                {suggestions.suggestedOccasions.map(occasion => (
                  <li key={occasion} className={css.tag}>
                    {occasion}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {suggestions.suggestedCategory ? (
            <div className={css.suggestionItem}>
              <p className={css.suggestionLabel}>Category</p>
              <p className={css.suggestionValue}>{suggestions.suggestedCategory}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AIAssistButton;
