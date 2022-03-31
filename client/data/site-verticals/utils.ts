import { translate } from 'i18n-calypso';
import type { SiteVerticalsVerticalApi, SiteVerticalsVertical } from './types';

export const mapSingleVerticalsApiToVertical = (
	vertical: SiteVerticalsVerticalApi
): SiteVerticalsVertical => ( {
	value: vertical.id,
	label: vertical.title,
	category: String( translate( 'Suggestions' ) ),
} );

export const mapManyVerticalsApiToVertical = (
	verticals: SiteVerticalsVerticalApi[]
): SiteVerticalsVertical[] => verticals.map( mapSingleVerticalsApiToVertical );
