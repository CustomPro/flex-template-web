import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { intlShape, injectIntl } from 'react-intl';
import { arrayOf, bool, func, object, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { ModalInMobile, Button } from '../../components';
import { BookingDatesForm } from '../../forms';
import { propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { parse, stringify } from '../../util/urlHelpers';
import config from '../../config';

import css from './BookingPanel.css';

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

const openBookModal = (isOwnListing, isClosed, history, location) => {
  if (isOwnListing || isClosed) {
    window.scrollTo(0, 0);
  } else {
    const { pathname, search, state } = location;
    const searchString = `?${stringify({ ...parse(search), book: true })}`;
    history.push(`${pathname}${searchString}`, state);
  }
};

const closeBookModal = (history, location) => {
  const { pathname, search, state } = location;
  const searchParams = omit(parse(search), 'book');
  const searchString = `?${stringify(searchParams)}`;
  history.push(`${pathname}${searchString}`, state);
};

const BookingPanel = props => {
  const {
    rootClassName,
    className,
    listing,
    isOwnListing,
    isClosed,
    unitType,
    price,
    handleBookingSubmit,
    richTitle,
    authorDisplayName,
    onManageDisableScrolling,
    timeSlots,
    fetchTimeSlotsError,
    history,
    location,
    intl,
  } = props;

  const showClosedListingHelpText = listing.id && isClosed;
  const { formattedPrice, priceTitle } = priceData(price, intl);
  const isBook = !!parse(location.search).book;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <ModalInMobile
        containerClassName={css.modalContainer}
        id="BookingDatesFormInModal"
        isModalOpenOnMobile={isBook}
        onClose={() => closeBookModal(history, location)}
        showAsModalMaxWidth={MODAL_BREAKPOINT}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <div className={css.modalHeading}>
          <h1 className={css.title}>{richTitle}</h1>
          <div className={css.author}>
            {
              // TOOD: check is class is required
            }
            <span className={css.authorName}>
              <FormattedMessage id="ListingPage.hostedBy" values={{ name: authorDisplayName }} />
            </span>
          </div>
        </div>

        <div className={css.bookingHeading}>
          <h2 className={css.bookingTitle}>
            <FormattedMessage id="ListingPage.bookingTitle" values={{ title: richTitle }} />
          </h2>
          <div className={css.bookingHelp}>
            <FormattedMessage
              id={
                showClosedListingHelpText
                  ? 'ListingPage.bookingHelpClosedListing'
                  : 'ListingPage.bookingHelp'
              }
            />
          </div>
        </div>
        {!isClosed ? (
          <BookingDatesForm
            className={css.bookingForm}
            submitButtonWrapperClassName={css.bookingDatesSubmitButtonWrapper}
            unitType={unitType}
            onSubmit={handleBookingSubmit}
            price={price}
            isOwnListing={isOwnListing}
            timeSlots={timeSlots}
            fetchTimeSlotsError={fetchTimeSlotsError}
          />
        ) : null}
      </ModalInMobile>
      <div className={css.openBookingForm}>
        <div className={css.priceContainer}>
          <div className={css.priceValue} title={priceTitle}>
            {formattedPrice}
          </div>
          <div className={css.perUnit}>
            <FormattedMessage id="ListingPage.perUnit" />
          </div>
        </div>

        {!isClosed ? (
          <Button
            rootClassName={css.bookButton}
            onClick={() => openBookModal(isOwnListing, isClosed, history, location)}
          >
            <FormattedMessage id="BookingPanel.ctaButtonMessage" />
          </Button>
        ) : (
          <div className={css.closedListingButton}>
            <FormattedMessage id="ListingPage.closedListingButtonText" />
          </div>
        )}
      </div>
    </div>
  );
};

BookingPanel.defaultProps = {
  rootClassName: null,
  className: null,
  isOwnListing: false,
  unitType: config.bookingUnitType,
  timeSlots: null,
  fetchTimeSlotsError: null,
};

BookingPanel.propTypes = {
  rootClassName: string,
  className: string,
  listing: propTypes.listing.isRequired,
  isOwnListing: bool,
  isClosed: bool.isRequired,
  unitType: propTypes.bookingUnitType,
  price: propTypes.money.isRequired,
  handleBookingSubmit: func.isRequired,
  richTitle: object,
  authorDisplayName: string.isRequired,
  onManageDisableScrolling: func.isRequired,
  timeSlots: arrayOf(propTypes.timeSlot),
  fetchTimeSlotsError: propTypes.error,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default compose(
  withRouter,
  injectIntl
)(BookingPanel);
