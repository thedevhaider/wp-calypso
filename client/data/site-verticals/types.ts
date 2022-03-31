export interface SiteVerticalsVerticalApi {
	id: string;
	title: string;
}

export interface SiteVerticalsVertical {
	value: string;
	label: string;
	category?: string;
}

export interface SiteVerticalsQueryParams {
	term?: string;
	limit?: number;
	skip_synonyms?: boolean;
}

export interface SiteVerticalsQueryOptions {
	enabled?: boolean;
}
