import { registerReducer } from 'calypso/state/redux-store';
import { allReducer, searchReducer } from './reducer';

registerReducer( [ 'verticalsV2All' ], allReducer );
registerReducer( [ 'verticalsV2' ], searchReducer );
