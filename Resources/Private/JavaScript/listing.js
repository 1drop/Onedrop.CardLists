'use strict';

(function () {

    // constants
    const ACTIVE = 'active';
    const HIDDEN = 'd-none';

    const BUTTON_IDS = ['grid-btn', 'list-btn'];
    const VIEW_IDS = ['grid-view', 'list-view'];

    const CARD_DROPDOWN_CLASS = 'sliding-card--dropdown-btn';
    const CARD_BODY_CLASS = 'sliding-card--body';


    // Helper Functions

    function getElements (ids) {
        let elements = [];
        let newElement;
        ids.forEach(function(id) {
            newElement = document.getElementById(id);
            if (newElement) {
                elements.push(newElement);
            }
        });
        return elements;
    }


    // Functions for switching between ListView and GridView

    function initButtonListener (activeButton, inactiveButton, activeView, inactiveView) {
        activeButton.addEventListener('click', function () {
            if (!activeButton.classList.contains(ACTIVE)) {
                activeButton.classList.add(ACTIVE);
                inactiveButton.classList.remove(ACTIVE);
                activeView.classList.remove(HIDDEN);
                inactiveView.classList.add(HIDDEN);
            }
        });
    }

    function initViewButtons () {
        let buttons = getElements(BUTTON_IDS);
        let views = getElements(VIEW_IDS);
        if(buttons.length === 2 && views.length === 2) {
            initButtonListener(buttons[0], buttons[1], views[0], views[1]);
            initButtonListener(buttons[1], buttons[0], views[1], views[0]);
        }
    }


    // Functions for opening and closing the SlidingCards

    function initCardListener (card) {
        let button = card.getElementsByClassName(CARD_DROPDOWN_CLASS)[0];
        let body = card.getElementsByClassName(CARD_BODY_CLASS)[0];
        button.addEventListener('click', function () {
            body.classList.toggle(HIDDEN);
            button.getElementsByTagName('i')[0].classList.toggle('filter-icon-angle-up');
            button.getElementsByTagName('i')[0].classList.toggle('filter-icon-angle-down');
        });
    }

    function initCardDropdowns () {
        let cards = document.getElementsByClassName('sliding-card');
        for (let i = 0; i < cards.length; ++i) {
            initCardListener(cards[i]);
        }
    }

    initViewButtons();
    initCardDropdowns();

})();
