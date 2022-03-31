import { map, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { generateGalleryShortcode } from 'calypso/lib/media/utils';
import { MediaContext } from 'calypso/my-sites/media/context';
import { getQuery } from 'calypso/my-sites/media/main';
import MediaModal from 'calypso/post-editor/media-modal';
import markup from 'calypso/post-editor/media-modal/markup';
import { bumpStat } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

class EditorMediaModal extends Component {
	static propTypes = {
		site: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onClose: PropTypes.func,
		isGutenberg: PropTypes.bool,
	};

	static defaultProps = {
		onInsertMedia: () => {},
		onClose: () => {},
	};

	state = {
		selectedItems: [],
		mediaQuery: {},
	};

	selectMediaItems = ( media = [] ) => {
		this.setState( { selectedItems: media.map( ( { ID } ) => ID ) } );
	};

	addToSelectedItems = ( media = [] ) => {
		this.setState( ( prevState ) => {
			const existingIds = prevState.selectedItems;
			const nextIds = media.reduce(
				( aggregatedIds, { ID: mediaId } ) =>
					existingIds.includes( mediaId ) ? aggregatedIds : [ ...aggregatedIds, mediaId ],
				[ ...existingIds ]
			);
			return { selectedItems: nextIds };
		} );
	};

	replaceSelectedMediaItem = ( ID, mediaItem ) => {
		this.setState( ( prevState ) => ( {
			selectedItems: prevState.selectedItems.map( ( mediaId ) =>
				mediaId === ID ? mediaItem.ID : mediaId
			),
		} ) );
	};

	setQuery = ( options ) => {
		this.setState( { mediaQuery: getQuery( options ) } );
	};

	insertMedia( { type, items, settings } ) {
		const { site } = this.props;
		let media;
		let stat;

		const getItemMarkup = ( item ) => markup.get( site, item );

		switch ( type ) {
			case 'gallery':
				if ( 'individual' === get( settings, 'type' ) ) {
					media = map( settings.items, getItemMarkup ).join( '' );
				} else {
					media = generateGalleryShortcode( settings );
				}

				stat = 'insert_gallery';
				break;

			case 'media':
			default:
				media = map( items, getItemMarkup ).join( '' );
				stat = 'insert_item';
		}

		if ( media ) {
			this.props.onInsertMedia( media );

			if ( stat ) {
				this.props.bumpStat( 'editor_media_actions', stat );
			}
		}

		this.props.onClose();
	}

	onClose = ( value ) => {
		if ( value ) {
			// `isGutenberg` means that the Media Modal has been opened by a Gutenberg media block,
			// as opposed to the Classic editor or the Classic block in Gutenberg.
			// This is needed because `insertMedia` returns the media markup, used by TinyMCE,
			// while `onClose` returns the media object, used by Gutenberg media blocks.
			return this.props.isGutenberg ? this.props.onClose( value ) : this.insertMedia( value );
		}
		this.props.onClose();
	};

	render() {
		return (
			<MediaContext.Provider
				value={ {
					selectedItemsIds: this.state.selectedItems,
					selectMediaItems: this.selectMediaItems,
					addToSelectedItems: this.addToSelectedItems,
					replaceSelectedMediaItem: this.replaceSelectedMediaItem,
					query: this.state.mediaQuery,
					setQuery: this.setQuery,
				} }
			>
				<MediaModal { ...this.props } onClose={ this.onClose } />;
			</MediaContext.Provider>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} ),
	{
		bumpStat,
	}
)( EditorMediaModal );
