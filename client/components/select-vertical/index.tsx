import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';

const SelectVertical = () => {
	const translate = useTranslate();

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
		</>
	);
};

export default SelectVertical;
