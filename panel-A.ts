import type {
    HomeSection,
    MusicPanelController,
    MusicPanelTab,
} from './types';


interface PanelControllerOptions {

    panelTabs:
        HTMLButtonElement[];

    panelViews:
        HTMLElement[];

    homeNavItems:
        HTMLButtonElement[];

    homeSections:
        HTMLElement[];

    panelCloseButton:
        HTMLButtonElement;

    closePanel:
        () => void;

    focusSearch:
        () => void;

    loadHomeSection:
        (
            section: HomeSection
        ) => void;
}


export function createPanelController(
    options: PanelControllerOptions
): MusicPanelController {

    const {
        panelTabs,
        panelViews,
        homeNavItems,
        homeSections,
        panelCloseButton,
        closePanel,
        focusSearch,
        loadHomeSection,
    } = options;


    function activatePanelTab(
        tab: MusicPanelTab
    ): void {

        panelTabs.forEach(
            button => {

                const isActive =
                    button.dataset.panelTab ===
                    tab;

                button.classList.toggle(
                    'is-active',
                    isActive
                );

                button.setAttribute(
                    'aria-selected',
                    String(isActive)
                );
            }
        );


        panelViews.forEach(
            view => {

                const isActive =
                    view.dataset.panelView ===
                    tab;

                view.classList.toggle(
                    'is-active',
                    isActive
                );
            }
        );
    }


    function activateHomeSection(
        section: HomeSection
    ): void {

        homeNavItems.forEach(
            button => {

                const isActive =
                    button.dataset
                        .homeSectionButton ===
                    section;

                button.classList.toggle(
                    'is-active',
                    isActive
                );


                if (
                    isActive
                ) {

                    button.setAttribute(
                        'aria-current',
                        'page'
                    );

                } else {

                    button.removeAttribute(
                        'aria-current'
                    );
                }
            }
        );


        homeSections.forEach(
            element => {

                element.classList.toggle(
                    'is-active',
                    element.dataset
                        .homeSection ===
                    section
                );
            }
        );


        loadHomeSection(
            section
        );
    }


    function showSearchPanel(): void {

        activatePanelTab(
            'search'
        );

        focusSearch();
    }


    panelCloseButton.addEventListener(
        'click',
        () => {

            closePanel();
        }
    );


    panelTabs.forEach(
        button => {

            button.addEventListener(
                'click',
                () => {

                    const tab =
                        button.dataset
                            .panelTab;

                    if (
                        tab !== 'home' &&
                        tab !== 'search' &&
                        tab !== 'playback'
                    ) {
                        return;
                    }

                    activatePanelTab(
                        tab
                    );
                }
            );
        }
    );


    homeNavItems.forEach(
        button => {

            button.addEventListener(
                'click',
                () => {

                    const section =
                        button.dataset
                            .homeSectionButton;

                    if (
                        section !==
                            'trending' &&
                        section !==
                            'discover' &&
                        section !==
                            'playlist' &&
                        section !==
                            'genres' &&
                        section !==
                            'stations'
                    ) {

                        return;
                    }

                    activatePanelTab(
                        'home'
                    );

                    activateHomeSection(
                        section
                    );
                }
            );
        }
    );


    return {
        activatePanelTab,
        activateHomeSection,
        showSearchPanel,
    };
}
