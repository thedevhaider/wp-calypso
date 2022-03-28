/**-
 *
 */
export function getTestAccountByJestGroup() {
	const env = process.env;

	if ( env.JEST_GROUP_JETPACK ) {
		return 'jetpackUser';
	}
	if ( env.JEST_GROUP_CALYPSO_PR ) {
		return 'simpleSitePersonalPlanUser';
	}
	return 'defaultUser';
}
