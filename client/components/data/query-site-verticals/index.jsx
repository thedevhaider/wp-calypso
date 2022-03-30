import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestVerticals } from 'calypso/state/site-verticals/actions';
import { getVerticals } from 'calypso/state/site-verticals/selectors';

export class QuerySiteVerticals extends Component {
	static propTypes = {
		isFetched: PropTypes.bool,
		isSkipSynonyms: PropTypes.bool,
		searchTerm: PropTypes.string,
		limit: PropTypes.number,
		debounceTime: PropTypes.number,
		debounceFunc: PropTypes.func,
	};

	static defaultProps = {
		isFetched: false,
		isSkipSynonyms: false,
		limit: 10,
		searchTerm: '',
		debounceTime: 0,
		debounceFunc: debounce,
	};

	bindDebouncedRequest = () => {
		const { debounceTime, debounceFunc } = this.props;

		if ( debounceTime > 0 ) {
			return debounceFunc( this.props.requestVerticals, this.props.debounceTime );
		}

		return this.props.requestVerticals;
	};

	componentDidMount() {
		const { searchTerm = '', limit, isFetched, isSkipSynonyms } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		this.debouncedRequest = this.bindDebouncedRequest();

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, limit, isSkipSynonyms );
		}
	}

	componentDidUpdate( prevProps ) {
		const { searchTerm, limit, debounceTime, isFetched, isSkipSynonyms } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		if ( prevProps.debounceTime !== debounceTime ) {
			this.debouncedRequest = this.bindDebouncedRequest();
		}

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, limit, isSkipSynonyms );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		isFetched: null !== getVerticals( state, ownProps.searchTerm ),
	} ),
	{
		requestVerticals,
	}
)( QuerySiteVerticals );
