import { registerReducer } from 'calypso/state/redux-store';
import verticalsV2Reducer from './reducer';

registerReducer( [ 'verticals-v2' ], verticalsV2Reducer );
