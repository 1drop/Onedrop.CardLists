'use strict';
/* global projectsList */
/* global Set */

(function () {

    // constants
    const HIDDEN = 'd-none';
    const FILTERIDSUBSTRING = 'filter-select-';
    const LISTPROPERTYIDSUBSTRING = 'list-property-';

    // global variables
    let filterKeys = [];
    let listPropertyKeys = [];
    let filters = {};
    let nodes = [];

    // Helpers

    function getKeyFromId(id, idSubstring) {
        return id.split(idSubstring)[1];
    }

    function getListElementId(nodeId) {
        return 'list-' + nodeId
    }

    function getGridElementId(nodeId) {
        return 'grid-' + nodeId
    }

    function getSelectByKey(key) {
        let selectId = FILTERIDSUBSTRING + key;
        return document.getElementById(selectId);
    }

    function getAllSelects() {
        let selects = [];

        filterKeys.forEach(function (key) {
            selects.push(getSelectByKey(key));
        });

        return selects;
    }

    // Function for initializing the key lists

    function addKeysToList(list, elements, idSubstring) {
        let regex = new RegExp('^' + idSubstring);
        for (let i = 0; i < elements.length; i++) {
            if (regex.test(elements[i].id)) {
                list.push(getKeyFromId(elements[i].id, idSubstring));
            }
        }
    }

    function initKeyLists() {
        let selects = document.getElementsByTagName('select');
        let divs = document.getElementsByTagName('div');
        addKeysToList(filterKeys, selects, FILTERIDSUBSTRING);
        addKeysToList(listPropertyKeys, divs, LISTPROPERTYIDSUBSTRING);
        listPropertyKeys = Array.from(new Set(listPropertyKeys));
    }


    // Functions for adding DOM elements to the list view

    function addNodeToGroupList(list, node) {
        for (let i = 0; i < list.length; ++i) {
            let currentGroup = list[i];
            for (let j = 0; j < list[i].length; ++j) {
                if (node['group'] === currentGroup[j].group) {
                    currentGroup.push(node);
                    return;
                }
            }
        }
        let newGroup = [node];
        list.push(newGroup);
    }

    function getNodesByGroup() {
        let groups = [];
        projectsList.forEach(function (node) {
            addNodeToGroupList(groups, node);
        });
        return groups;
    }

    function createListItemProperties(node, listItem) {
        listPropertyKeys.forEach(function (key) {
            let property = document.createElement('div');
            property.innerHTML = node[key];
            property.classList = 'list-item--' + key;
            listItem.appendChild(property);
        });
    }

    function createListItemLink(node, listItem) {
        let link = document.createElement('a');
        link.href = node.link;
        link.classList = 'list-item--link';
        createListItemProperties(node, link);
        listItem.appendChild(link);
    }

    function createListItem(node) {
        let newListItem = document.createElement('li');
        newListItem.id = 'list-' + node.id;
        newListItem.classList = 'list-item';
        if (node.link) {
            createListItemLink(node, newListItem);
        } else {
            createListItemProperties(node, newListItem);
        }
        return newListItem;
    }

    function addGroupToHTML(group) {
        let list = document.getElementById('list-view');
        let headline = document.createElement('h2');
        headline.innerHTML = group[0].group;
        headline.classList = 'list-view--headline';
        list.appendChild(headline);

        for (let i = 0; i < group.length; ++i) {
            list.appendChild(createListItem(group[i]));
        }
    }

    function initList() {
        let list = document.getElementById('list-view');
        if(list) {
            let groups = getNodesByGroup();
            groups.forEach(addGroupToHTML);
        }
    }
    

    // Function for initializing the list of nodes

    function initNodes() {
        projectsList.forEach(function (project) {
            let newNode = {
                listElement: document.getElementById(getListElementId(project.id)),
                gridElement: document.getElementById(getGridElementId(project.id)),
                group: project.group,
                name: project.name
            };
            filterKeys.forEach(function (key) {
                newNode[key] = project[key];
            });
            nodes.push(newNode);
        });
    }


    // Functions for creating the lists used for dropdown initialization and update

    function addKeyToList(list, key, node) {
        for (let i = 0; i < list.length; ++i) {
            if (node[key] === list[i]) {
                return
            }
        }
        list.push(node[key]);
    }

    function getSelectOptionsLists(nodeList) {
        let lists = [];

        filterKeys.forEach(function (key) {
            let list = [];
            nodeList.forEach(function (node) {
                addKeyToList(list, key, node);
            });
            lists.push(list);
        });

        return lists;
    }


    // Functions for updating the visibility of dropdown options upon filter selection

    function setOption(option, list) {
        for (let i = 0; i < list.length; ++i) {
            if (list[i] === option.value) {
                if (option.classList.contains(HIDDEN)) {
                    option.classList.remove(HIDDEN);
                }
                return;
            }
        }
        if (!option.classList.contains(HIDDEN)) {
            option.classList.add(HIDDEN);
        }
    }

    function updateDropdowns() {
        let select;
        let activeOptionsLists = getSelectOptionsLists(getActiveNodes());
        filterKeys.forEach(function (key, index) {
            if (!filters[key]) {
                select = getSelectByKey(key);
                for (let i = 2; i < select.options.length; ++i) {
                    setOption(select.options[i], activeOptionsLists[index]);
                }
            }
        });
    }


    function hideSelectOptions(options, selectedIndex) {
        for (let i = 0; i < options.length; i++) {
            if (i !== selectedIndex) {
                options[i].classList.toggle(HIDDEN);
            }
        }
    }

    function resetSelectOptions(select) {
        select.options[0].classList.toggle(HIDDEN);
        select.options[1].classList.toggle(HIDDEN);
        select.selectedIndex = 0;
    }


    // Functions for updating the visibility of grid and list elements upon filter selection

    function getActiveNodes() {
        let active;
        let activeNodes = [];
        nodes.forEach(function (node) {
            active = true;
            filterKeys.forEach(function (key) {
                if (filters[key] && filters[key] !== node[key]) {
                    active = false;
                }
            });

            if (active) {
                activeNodes.push(node);
            }
        });
        return activeNodes;
    }

    function checkGroupActive(activeNodes, group) {
        for (let i = 0; i < activeNodes.length; i++) {
            if (activeNodes[i].group === group[0].group) {
                return true;
            }
        }
        return false;
    }

    function checkNodeActive(activeNodes, currentNode) {
        for (let i = 0; i < activeNodes.length; i++) {
            if (activeNodes[i] === currentNode) {
                return true;
            }
        }
        return false;
    }

    function updateHeadlines(activeNodes) {
        let headlines = document.getElementsByClassName('list-view--headline');
        let groups = getNodesByGroup();
        for (let i = 0; i < groups.length; ++i) {
            if (checkGroupActive(activeNodes, groups[i])) {
                if (headlines[i].classList.contains(HIDDEN)) {
                    headlines[i].classList.remove(HIDDEN);
                    headlines[i].classList.remove(HIDDEN);
                }
            } else {
                if (!headlines[i].classList.contains(HIDDEN)) {
                    headlines[i].classList.add(HIDDEN);
                    headlines[i].classList.add(HIDDEN);
                }
            }
        }
    }

    function updateListing() {
        let activeNodes = getActiveNodes();
        nodes.forEach(function (node) {
            if (checkNodeActive(activeNodes, node)) {
                if (node.listElement.classList.contains(HIDDEN)) {
                    node.listElement.classList.remove(HIDDEN);
                    node.gridElement.classList.remove(HIDDEN);
                }
            } else {
                if (!node.listElement.classList.contains(HIDDEN)) {
                    node.listElement.classList.add(HIDDEN);
                    node.gridElement.classList.add(HIDDEN);
                }
            }
        });
        updateHeadlines(activeNodes);
    }


    // Functions for updating the list of active filters upon filter selection

    function removeActiveFilter(select) {
        let key = getKeyFromId(select.id, FILTERIDSUBSTRING);
        filters[key] = null;
        resetSelectOptions(select);
        updateDropdowns();
        updateListing();
    }

    function addActiveFilter(select) {
        let options = select.options;
        let index = select.selectedIndex;
        let key = getKeyFromId(select.id, FILTERIDSUBSTRING);
        filters[key] = options[index].value;
        hideSelectOptions(options, index);
        updateDropdowns();
        updateListing();
    }


    // Function for handling filter selections

    function filterBy(select) {
        switch (select.selectedIndex) {
            case 0:
                break;
            case 1:
                removeActiveFilter(select);
                break;
            default:
                addActiveFilter(select);
        }
    }


    // Functions for initializing the filter dropdowns

    function addOptionsToSelect(list, select) {
        for (let i = 0; i < list.length; ++i) {
            let newOption = document.createElement('option');
            newOption.value = list[i];
            newOption.innerHTML = list[i];
            select.appendChild(newOption);
        }
    }

    function initSelectListener(select) {
        select.onchange = function () {
            filterBy(select);
        };
    }

    function initSelects() {
        let lists = getSelectOptionsLists(projectsList);
        let selects = getAllSelects();

        for (let i = 0; i < lists.length; ++i) {
            addOptionsToSelect(lists[i], selects[i]);
            initSelectListener(selects[i]);
        }
    }


    // Initialization

    function initFilter() {
        if (typeof projectsList !== 'undefined') {
            initKeyLists();
            initList();
            initNodes();
            initSelects();
        }
    }

    initFilter();
})();
