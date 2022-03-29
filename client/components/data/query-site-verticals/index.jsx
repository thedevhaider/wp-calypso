import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestVerticals } from 'calypso/state/site-verticals/actions';
import { getVerticals } from 'calypso/state/site-verticals/selectors';

export class QuerySiteVerticals extends Component {
	static propTypes = {
		isFetched: PropTypes.bool,
		searchTerm: PropTypes.string,
		limit: PropTypes.number,
		debounceTime: PropTypes.number,
		debounceFunc: PropTypes.func,
	};

	static defaultProps = {
		isFetched: false,
		limit: 7,
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
		const { searchTerm = '', limit, isFetched } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		this.debouncedRequest = this.bindDebouncedRequest();

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, limit );
		}
	}

	componentDidUpdate( prevProps ) {
		const { isFetched, searchTerm, limit, debounceTime } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		if ( prevProps.debounceTime !== debounceTime ) {
			this.debouncedRequest = this.bindDebouncedRequest();
		}

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, limit );
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
