export interface BrowseUsersParams {
  search?: string;
  category?: string;
  level?: string;
  location?: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}
