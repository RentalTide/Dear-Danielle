import React from 'react';
import classNames from 'classnames';
import { Heading, PropertyGroup } from '../../components';

import css from './CustomExtendedDataSection.module.css';

const SectionMultiEnum = props => {
  const {
    heading,
    options,
    selectedOptions,
    idPrefix,
    className,
    rootClassName,
    showUnselectedOptions = false,
  } = props;
  const hasContent = selectedOptions?.length > 0;
  if (!heading || !options || !hasContent) {
    return null;
  }
  const idSlug = heading.toLowerCase().replace(/ /g, '_');

  const classes = classNames(rootClassName || css.sectionMultiEnum, className);

  // Render as tags for fashion marketplace
  const selectedTags = options.filter(o => selectedOptions.includes(o.key));

  return (
    <section className={classes}>
      <Heading as="h2" rootClassName={css.sectionHeading}>
        {heading}
      </Heading>
      <div className={css.tagList}>
        {selectedTags.map(tag => (
          <span key={tag.key} className={css.tag}>
            {tag.label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default SectionMultiEnum;
