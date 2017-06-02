# CardLists

The purpose of this Neos package is to help you create lists of cards similar to the ones at [DP Architekten](https://www.dparchitekten.com/projekte.html).
The package contains two types of lists: the basic card list, and the filterable card list.

# Installation

1. Download and unzip the package under app/Packages/Application.
2. Run composer install and npm install.
3. For a basic card list, use `Onedrop.CardLists:List` and `Onedrop.CardLists:Card`.
4. For a card list with a filter and a list view, use `Onedrop.CardLists:FilterableList` and `Onedrop.CardLists:FilterableCard`.

## Onedrop.CardLists:List

For a basic card list, you need one NodeType for the list itself and one for the cards.

1. Create a yaml file for the card:
    ```
    'My.Site:Card':
      superTypes:
        'Onedrop.CardLists:Card': true
      ui:
        label: i18n
      properties:
        text:
          type: string
          defaultValue: ''
          ui:
            inlineEditable: true
            aloha:
              placeholder: 'Text'
    ```
2. Create a yaml file for the list:
    ```
    'My.Site:List':
      superTypes:
        'Onedrop.CardLists:List': true
      ui:
        label: i18n
      childNodes:
        cards:
          type: 'Neos.Neos:ContentCollection'
          constraints:
            nodeTypes:
              '*': false
              'My.Site:Card': true
    ```
3. Create a fusion file for the card:
    ```
    prototype(My.Site:Card) < prototype(Neos.Neos:Content) {
        sectionName = 'Main'
    
        image = Neos.NodeTypes:Image {
            @context.node = ${node}
            maximumWidth = 512
            maximumHeight = 512
        }
    
        id = ${node.identifier}
    }
    ```
4. Create a fusion file for the list:
    ```
    prototype(Onedrop.IbReitberger:TeamMemberList) < prototype(Onedrop.CardLists:List) {
        listTitle = ${Translation.translate('listTitle', null, [], 'Templates/List', 'My.Site')}
    }
    
    ```
5. Create a fluid template for the card:
    ```
    <f:section name="Main">
        <div class="card--wrapper">
            <div class="card">
                <div class="card--header row">
                    <div class="card--image col-sm-6">
                        {image -> f:format.raw()}
                    </div>
                    <div class="sliding-card--header-text col-sm-6">
                        <neos:contentElement.editable property="name" tag="h3"/>
                        <neos:contentElement.editable property="text" tag="p" />
                    </div>
                </div>
            </div>
        </div>
    </f:section>
    ```
6. Create a fluid template for the list:
    ```
    <f:section name="Main">
        <div class="card-list">
            <div class="title-bar">
                <div class="container">
                    <div class="title-bar--container">
                        <div class="title-bar--left">
                            <h1>{listTitle -> f:format.raw()}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div id="grid-view" class="grid container">
                {cards -> f:format.raw()}
            </div>
        </div>
    </f:section>
    </html>

    ```
7. Create translation files.

The package contains an example implementation of the basic card list (`Onedrop.CardLists:ExampleList`).

## Onedrop.CardLists:FilterableList

The filterable card list is an extension of the basic card list, and differs from it in the following ways:
1. The title bar contains dropdowns which are used to filter the cards by properties
2. The title bar contains two buttons for switching between the grid view and the list view (while the basic card list has only the grid view)
3. Each card can be assigned a category, by which it can be filtered
4. Each card can be assigned a group, which is used for grouping elements in the list view

The steps for creating a filterable card list are similar to the ones for creating a basic card list, with the following adjustments:

1. The card inherits from `Onedrop.CardLists:FilterableCard`, not from `Onedrop.CardLists:Card`.
2. The list inherits from `Onedrop.CardLists:FilterableList`, not from `Onedrop.CardLists:List`.
3. In the fusion file for the card, add the line `id = ${node.identifier}`.
4. In the fusion file for the list, create a `Neos.Fusion:RawCollection` called json:
    ```
    json = Neos.Fusion:RawCollection {
        collection = ${q(node).children('cards').children('[instanceof Onedrop.CardLists:Card]')}
        itemName = 'listItem'
        itemRenderer = Neos.Fusion:RawArray {
            name = ${q(listItem).property('name')}
            id = ${listItem.identifier}
            group = ${q(q(listItem).property('group')).property('name')}
            category = ${q(q(listItem).property('category')).property('name')}
            property = ${q(listItem).property('property')}
        }
        @process.json = ${Json.stringify(value)}
    }
    ```
    For each item in the collection, the JSON object passes the name, the id, the group, the category, and any other properties which should be filterable.
5. In the fluid template for the card, set the card's id to `grid-{id -> f:format.raw()}`.
6. In the fluid template for the card, mark the properties which should be visible in the list view by giving them an id beginning with `list-property-`, e.g. `list-property-name`. Make sure that the suffix of each id is identical to the name of the corresponding property defined in the fusion or yaml.
7. In the fluid template for the list, extend the title bar by the select dropdowns and the view-toggle buttons:
    ```
    <div class="title-bar--right">
        <div class="filter-list" id="filter-list">
            <div class="filter-list--select filter-icon-angle-down">
                <select id="filter-select-category">
                    <option>Category</option>
                    <option class="d-none">Remove filter</option>
                </select>
            </div>
            <div class="filter-list--select filter-icon-angle-down">
                <select id="filter-select-property">
                    <option>Property</option>
                    <option class="d-none">Remove filter</option>
                </select>
            </div>
        </div>
        <div class="btn grid-btn active" id="grid-btn"><i class="filter-icon-grid"></i></div>
        <div class="btn list-btn" id="list-btn"><i class="filter-icon-list"></i></div>
    </div>
    ```
    * Make sure that the select ids begin with `filter-select-`, and that the suffixes are identical to the names of the properties by which the cards should be filtered. 
    * Note that the first option defined in the select is the name of the filter, and the second option is for deleting active filters and needs to have the class `d-none` for the filter to work properly. All other select options will be added dynamically.
8. In the fluid template for the list, add the configuration options for the groups and categories:
    ```
    <f:if condition="{neos:rendering.inBackend()} && {neos:rendering.inEditMode()}">
        <div class="filter-config alert alert-info">
            <h2>Categories (only visible in backend):</h2>
            <div class="filter-config--list">
                {categories -> f:format.raw()}
            </div>
            <h2>Groups (only visible in backend:</h2>
            <div class="filter-config--list">
                {groups -> f:format.raw()}
            </div>
        </div>
    </f:if>
    ```

The package contains an example implementation of the filterable card list (`Onedrop.CardLists:ExampleFilterableList`).

## Sliding Cards

This package also contains JS and CSS for the dropdown-cards used on the [DP Architekten](https://www.dparchitekten.com/projekte.html) website. To use these, adjust your card template in the following way:

1. Replace the `card` classes with `sliding-card`.
2. Add the following fluid code to your template, just below the card header:
    ```
    <f:if condition="{neos:rendering.inBackend()}">
        <f:then>
            <!-- your body -->
            <div class="sliding-card--dropdown-btn">
                <i class="filter-icon-angle-up"></i>
            </div>
        </f:then>
        <f:else>
            <!-- your body -->
            <div class="sliding-card--dropdown-btn">
                <i class="filter-icon-angle-down"></i>
            </div>
        </f:else>
    </f:if>
    ```
