import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import { Heading } from '../../components';

import css from './CustomExtendedDataSection.module.css';

/**
 * Maps condition values to visual styles.
 * Returns a className suffix for condition-specific badge coloring.
 */
const getConditionClass = value => {
  const v = typeof value === 'string' ? value.toLowerCase().replace(/\s+/g, '-') : '';
  if (v.includes('new')) return css.conditionNew;
  if (v.includes('like-new') || v.includes('like new')) return css.conditionLikeNew;
  if (v.includes('good')) return css.conditionGood;
  if (v.includes('fair')) return css.conditionFair;
  return null;
};

/**
 * Checks if a field key represents a "special" field that gets
 * enhanced rendering on the fashion listing page.
 */
const isConditionField = key => key === 'condition';
const isSizeField = key => key === 'size';
const isBrandField = key => key === 'brand';

const SectionDetails = props => {
  const { fieldConfigs, pickExtendedDataFields, heading, className, rootClassName } = props;

  const classes = classNames(rootClassName || css.sectionDetails, className);

  if (!fieldConfigs) {
    return null;
  }

  const existingFields = fieldConfigs?.reduce(pickExtendedDataFields, []);

  if (!existingFields?.length) {
    return null;
  }

  // Separate brand field for prominent display
  const brandField = existingFields.find(f => isBrandField(f.key));
  const otherFields = existingFields.filter(f => !isBrandField(f.key));

  return (
    <section className={classes}>
      {/* Brand displayed prominently above other details */}
      {brandField ? (
        <div className={css.brandBlock}>
          <span className={css.brandLabel}>{brandField.label}</span>
          <span className={css.brandValue}>{brandField.value}</span>
        </div>
      ) : null}

      {heading && otherFields.length > 0 ? (
        <Heading as="h2" rootClassName={css.sectionHeading}>
          <FormattedMessage id={heading} />
        </Heading>
      ) : null}

      {otherFields.length > 0 ? (
        <ul className={css.details}>
          {otherFields.map(detail => {
            // Condition gets a color-coded badge
            if (isConditionField(detail.key)) {
              const conditionClass = getConditionClass(detail.value);
              return (
                <li key={detail.key} className={classNames(css.conditionBadge, conditionClass)}>
                  <span className={css.conditionDot} />
                  <span>{detail.value}</span>
                </li>
              );
            }

            // Size gets a pill treatment
            if (isSizeField(detail.key)) {
              return (
                <li key={detail.key} className={css.sizePill}>
                  <span className={css.sizeLabel}>{detail.label}</span>
                  <span className={css.sizeValue}>{detail.value}</span>
                </li>
              );
            }

            // Default detail row
            return (
              <li key={detail.key} className={css.detailsRow}>
                <span className={css.detailLabel}>{detail.label}</span>
                <span>{detail.value}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
};

export default SectionDetails;
