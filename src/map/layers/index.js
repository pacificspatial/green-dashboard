export const MapLayerMenuGroups = {
    tree: {
        multiSelect: true,
        order: 3,
    },
    error: {
        multiSelect: false,
        order: 4,
    }
}

export const MainMapLayerDefs = { // atが低い方が下に回る
    "C99L-AATQ-F47T-E9S9": {
        chiyodaTree: { onTouch: "select_tree", label: "千代田区街路樹", menuGroup: "tree", filter: "tree", at: 2, menuOrder: 1 },
        tokyo2Tree: { label: "東京都街路樹", menuGroup: "tree", "filter": "tree", defaultVisible: false, at: 1, menuOrder: 2 },
        asesCompC: { onTouch: "select_tree", label: "総合評価C", menuGroup: "error", defaultVisible: false, filter: "tree", at: 7, menuOrder: 3 },
        listHoverTree: { inMenu: false, listHoverTree: true, filter: "tree", defaultVisible: true, at: 10 },
    },
    "CECZ-7464-MVP9-999A": {
        daimaruyuTree: { onTouch: "select_tree", label: "大丸有アトラスとホトリア", menuGroup: "tree", filter: "tree", at: 2, menuOrder: 1 },
        tokyo2Tree: { label: "東京都街路樹", menuGroup: "tree", "filter": "tree", defaultVisible: false, at: 1, menuOrder: 2 },
        listHoverTree: { inMenu: false, listHoverTree: true, filter: "tree", defaultVisible: true, at: 10 },
    },
    "LX96-QCSS-TW4E-6HQ6": {
        tokyoTree: { onTouch: "select_tree", label: "東京都街路樹", menuGroup: "tree", "filter": "tree", at: 1 },
        listHoverTree: { inMenu: false, listHoverTree: true, filter: "tree", defaultVisible: true, at: 10 },
    },
    "CHGE-W6CH-TJL4-QV7N": {
        takeshibaTree: { onTouch: "select_tree", label: "港区街路樹", menuGroup: "tree", filter: "tree", at: 2, menuOrder: 2 },
        tokyo2Tree: { label: "東京都街路樹", menuGroup: "tree", "filter": "tree", defaultVisible: false, at: 1, menuOrder: 2 },
        listHoverTree: { inMenu: false, listHoverTree: true, filter: "tree", defaultVisible: true, at: 10 },
    },
    default: {
        tree: { onTouch: "select_tree", label: "街路樹", menuGroup: "tree", filter: "tree", at: 1, menuOrder: 1 },
        asesCompC: { onTouch: "select_tree", label: "総合評価C", menuGroup: "error", defaultVisible: false, filter: "tree", at: 7, menuOrder: 2 },
        listHoverTree: { inMenu: false, listHoverTree: true, filter: "tree", defaultVisible: true, at: 10 },
    }
}