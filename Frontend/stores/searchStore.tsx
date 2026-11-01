import { create } from 'zustand';

type SearchStore = {
    searchText: string,
    setText: (newText: string) => void
}

export const useSearchTextStore = create<SearchStore>((set) => 
    ({
        searchText: "",
        setText: (newText) => {
            set({
                searchText: newText
            });
        }
    })
)
