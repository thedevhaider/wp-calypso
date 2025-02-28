import { localize } from 'i18n-calypso';
import { capitalize, find } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { canAccessAds } from 'calypso/lib/ads/utils';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import AdsSettings from 'calypso/my-sites/earn/ads/form-settings';
import WordAdsPayments from 'calypso/my-sites/earn/ads/payments';
import WordAdsEarnings from 'calypso/my-sites/stats/wordads/earnings';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import AdsWrapper from './ads/wrapper';
import Home from './home';
import MembershipsSection from './memberships';
import MembershipsProductsSection from './memberships/products';
import ReferAFriendSection from './refer-a-friend';

class EarningsMain extends Component {
	static propTypes = {
		section: PropTypes.string,
		site: PropTypes.object,
		query: PropTypes.object,
	};

	getSelectedText() {
		const selected = find( this.getFilters(), { path: this.props.path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	}

	getFilters() {
		const { siteSlug, translate } = this.props;
		const pathSuffix = siteSlug ? '/' + siteSlug : '';
		const tabs = [];

		if ( canAccessAds( this.props.site ) ) {
			tabs.push( {
				title: translate( 'Earnings' ),
				path: '/earn/ads-earnings' + pathSuffix,
				id: 'ads-earnings',
			} );
			tabs.push( {
				title: translate( 'Payments' ),
				path: '/earn/ads-payments' + pathSuffix,
				id: 'ads-payments',
			} );
			tabs.push( {
				title: translate( 'Settings' ),
				path: '/earn/ads-settings' + pathSuffix,
				id: 'ads-settings',
			} );
		}

		return tabs;
	}

	getComponent( section ) {
		switch ( section ) {
			case 'ads-earnings':
				return (
					<AdsWrapper section={ this.props.section }>
						<WordAdsEarnings site={ this.props.site } />
					</AdsWrapper>
				);
			case 'ads-payments':
				return (
					<AdsWrapper section={ this.props.section }>
						<WordAdsPayments site={ this.props.site } />
					</AdsWrapper>
				);
			case 'ads-settings':
				return (
					<AdsWrapper section={ this.props.section }>
						<AdsSettings />
					</AdsWrapper>
				);
			case 'payments':
				return <MembershipsSection section={ this.props.section } query={ this.props.query } />;
			case 'payments-plans':
				return <MembershipsProductsSection section={ this.props.section } />;

			case 'refer-a-friend':
				return <ReferAFriendSection />;

			default:
				return <Home />;
		}
	}

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	/**
	 * Remove any query parameters from the path before using it to
	 * identify which screen the user is seeing.
	 *
	 * @returns {string} Path to current screen.
	 */
	getCurrentPath = () => {
		let currentPath = this.props.path;
		const queryStartPosition = currentPath.indexOf( '?' );
		if ( queryStartPosition > -1 ) {
			currentPath = currentPath.substring( 0, queryStartPosition );
		}
		return currentPath;
	};

	/**
	 * Check the current path and returns an appropriate title.
	 *
	 * @returns {string} Header text for current screen.
	 */
	getHeaderText = () => {
		const { translate } = this.props;

		switch ( this.props.section ) {
			case 'payments':
				return translate( 'Payments' );
			case 'ads-earnings':
			case 'ads-payments':
			case 'ads-settings':
				return translate( 'Ads' );

			case 'refer-a-friend':
				return translate( 'Refer-a-Friend Program' );

			default:
				return '';
		}
	};

	/**
	 * Goes back to Earn home.
	 *
	 * @returns {string} Path to Earn home. Has site slug append if it exists.
	 */
	goBack = () => ( this.props.siteSlug ? '/earn/' + this.props.siteSlug : '' );

	getHeaderCake = () => {
		const headerText = this.getHeaderText();
		return headerText && <HeaderCake backHref={ this.goBack() }>{ headerText }</HeaderCake>;
	};

	getSectionNav = ( section ) => {
		const currentPath = this.getCurrentPath();

		return (
			! section.startsWith( 'payments' ) &&
			! section.startsWith( 'refer-a-friend' ) && (
				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs>
						{ this.getFilters().map( ( filterItem ) => {
							return (
								<NavItem
									key={ filterItem.id }
									path={ filterItem.path }
									selected={ filterItem.path === currentPath }
								>
									{ filterItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>
				</SectionNav>
			)
		);
	};

	render() {
		const { adsProgramName, section, translate } = this.props;
		const component = this.getComponent( this.props.section );

		const layoutTitles = {
			earnings: translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
			settings: translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
			payments: translate( 'Recurring Payments' ),
			'payments-plans': translate( 'Recurring Payments plans' ),
			'refer-a-friend': translate( 'Refer-a-Friend Program' ),
		};

		return (
			<Main wideLayout={ true } className="earn">
				<PageViewTracker
					path={ section ? `/earn/${ section }/:site` : `/earn/:site` }
					title={ `${ adsProgramName } ${ capitalize( section ) }` }
				/>
				<DocumentHead title={ layoutTitles[ section ] } />
				<FormattedHeader
					brandFont
					className="earn__page-header"
					headerText={ translate( 'Earn' ) }
					subHeaderText={ translate(
						'Explore tools to earn money with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="earn" showIcon={ false } />,
							},
						}
					) }
					align="left"
				/>
				{ this.getHeaderCake() }
				{ section && this.getSectionNav( section ) }
				{ component }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( EarningsMain ) );
