import { createHigherOrderComponent } from '@wordpress/compose';
import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'calypso/data/media/use-media-query';
import { getTransientMediaItems } from 'calypso/state/selectors/get-transient-media-items';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const MediaContext = createContext( {
	selectedItemsIds: [],
	selectMediaItems: () => {},
	addToSelectedItems: () => {},
	replaceSelectedMediaItem: () => {},
	query: {},
	setQuery: () => {},
} );

export const useMediaContext = () => {
	return useContext( MediaContext );
};

export const useSelectedItems = () => {
	const {
		query,
		selectedItemsIds,
		selectMediaItems,
		replaceSelectedMediaItem,
		addToSelectedItems,
	} = useMediaContext();

	const siteId = useSelector( getSelectedSiteId );
	const { data } = useMediaQuery( siteId, query );

	const transientMediaItems = useSelector( ( state ) => getTransientMediaItems( state, siteId ) );

	const media = data?.media ?? [];
	const mediaWithTransientItems = transientMediaItems.length
		? transientMediaItems.concat( media )
		: media;

	const selectedItems = selectedItemsIds
		.map( ( mediaId ) => mediaWithTransientItems.find( ( { ID } ) => ID === mediaId ) )
		.filter( ( i ) => i );

	return { selectedItems, selectMediaItems, replaceSelectedMediaItem, addToSelectedItems };
};

export const withSelectedItems = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { selectedItems, selectMediaItems } = useSelectedItems();

		return (
			<Wrapped { ...props } selectedItems={ selectedItems } selectMediaItems={ selectMediaItems } />
		);
	},
	'WithSelectedItems'
);
