frappe.provide('frappe.ui');

frappe.ui.SlimDesk = class SlimDesk {
    constructor() {
        this.wrapper = $('#slim-sidebar');
        console.log("SlimDesk v3.40 Init");
        this.init_when_ready();
    }

    init_when_ready() {
        if (window.frappe && frappe.boot && (frappe.boot.workspaces || frappe.boot.allowed_workspaces)) {
            this.setup();
            // Re-check periodically in case of hard reload clearing DOM
            setInterval(() => {
                if ($('#slim-sidebar').length === 0 && frappe.get_route_str().startsWith('app')) {
                    this.setup();
                }
            }, 2000);
        } else {
            setTimeout(() => this.init_when_ready(), 100);
        }
    }

    setup() {
        if ($('#slim-sidebar').length > 0) return;
        // console.log("SlimDesk Setup Triggered");
        this.fetch_data();
        this.inject_sidebar();
        this.bind_global_events();
    }

    inject_sidebar() {
        this.wrapper = $(`
            <div id="slim-sidebar">
                <div class="slim-top-section">
                    <div class="slim-icon slim-home-icon" data-toggle="tooltip" title="Desk">
                        ${frappe.utils.icon('grid', 'lg')}
                    </div>
                    <div class="slim-divider"></div>
                </div>
                <div class="slim-scroll-section"></div>
                <div class="slim-bottom-section">
                    <div class="slim-icon slim-edit-icon" data-toggle="tooltip" title="Customize">
                         ${frappe.utils.icon('edit', 'md')}
                    </div>
                </div>
            </div>
        `).prependTo('body');

        // Direct Binding
        this.wrapper.find('.slim-home-icon').on('click', () => frappe.set_route('/app'));
        this.wrapper.find('.slim-edit-icon').on('click', () => this.open_customize_dialog());

        this.render_items();
    }

    fetch_data() {
        if (frappe.boot.allowed_workspaces) {
            this.workspaces = frappe.boot.allowed_workspaces;
        } else if (frappe.boot.workspaces && frappe.boot.workspaces.pages) {
            this.workspaces = frappe.boot.workspaces.pages;
        }

        let raw_config = frappe.defaults.get_user_default("slim_desk_config");
        if (!raw_config) {
            this.config = this.workspaces
                .filter(w => !w.hidden && w.name !== 'Settings') // Filter hidden
                .map(w => this.workspace_to_item(w));
        } else {
            try {
                let parsed = JSON.parse(raw_config);
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    // It's a list of names (old save format)
                    this.config = [];
                    parsed.forEach(name => {
                        let w = this.workspaces.find(ws => ws.name === name);
                        if (w) this.config.push(this.workspace_to_item(w));
                    });
                } else {
                    // Full object config
                    this.config = parsed;
                }
            } catch (e) {
                this.config = this.workspaces.map(w => this.workspace_to_item(w));
            }
        }

        // Sort Alphabetically (Match Desk)
        if (!raw_config) {
            this.config.sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name));
        }
    }



    workspace_to_item(w) {
        let icon_val = w.icon;
        let use_letter = false;
        if (!icon_val || icon_val === 'folder' || icon_val === 'folder-normal') {
            use_letter = true;
        }
        return {
            name: w.name,
            label: w.title || w.name,
            type: 'workspace',
            icon: icon_val,
            use_letter: use_letter,
            route: w.route || `/app/${frappe.router.slug(w.name)}`,
            hidden: false
        };
    }

    bind_global_events() {
        const self = this;
        // ONLY bind Router/Tooltip logic here. Click events are now direct.
        frappe.router.on('change', () => {
            // Robust Re-check: If sidebar is missing, rebuild.
            if ($('#slim-sidebar').length === 0) self.setup();
            setTimeout(() => self.highlight_active(), 200);
        });

        $('body').tooltip({
            selector: '#slim-sidebar [data-toggle="tooltip"]',
            trigger: 'hover',
            placement: 'right',
            boundary: 'window',
            container: 'body',
            delay: { "show": 500, "hide": 100 }
        });
    }

    render_items() {
        const $container = $('#slim-sidebar .slim-scroll-section');
        $container.empty();
        this.config.forEach(item => {
            if (item.hidden) return;
            this.append_icon($container, item);
        });
        this.highlight_active();
    }

    append_icon($container, item) {
        let icon_html = this.get_icon_html(item);
        let $item = $(`
            <div class="slim-icon-wrapper" data-route="${item.route}" data-toggle="tooltip" title="${item.tooltip || item.label}">
                <div class="slim-icon" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                    ${icon_html}
                </div>
            </div>
        `);

        // Direct Click Binding
        $item.on('click', function () {
            try {
                let route = $(this).attr('data-route');
                $('#slim-sidebar .slim-icon-wrapper').removeClass('active');
                $(this).addClass('active');
                if (route) {
                    if (route.startsWith('/app/')) {
                        let parts = route.substring(5).split('/');
                        frappe.set_route(parts);
                    } else {
                        frappe.set_route(route);
                    }
                }
            } catch (e) { console.error(e); }
        });

        $item.appendTo($container);
    }

    get_icon_html(item) {
        try {
            let icon_val = item.icon;

            // Debug specific items to trace logic
            let debug_mode = (item.name === 'Assets' || item.name === 'Buying' || item.label === 'Assets');

            // Safe Runtime Fallback (Check existence of globals first)
            // Use frappe.boot.workspaces.pages (Verified Source)
            if (item.type === 'workspace' && frappe.boot && frappe.boot.workspaces && frappe.boot.workspaces.pages) {
                let found_page = frappe.boot.workspaces.pages.find(p => p.name === item.name || p.title === item.label);

                if (debug_mode) {
                    console.log(`[SlimDesk Debug] Lookup '${item.name}':`, found_page ? "Found" : "Not Found");
                    if (found_page) console.log(`   -> Boot Icon: ${found_page.icon}`);
                }

                if (found_page && found_page.icon) {
                    icon_val = found_page.icon;
                }
            } else if (item.type === 'workspace' && frappe.boot && frappe.boot.workspace_sidebar_item && frappe.boot.workspace_sidebar_item.pages) {
                // Backup check if the other one is missing
                let found_page = frappe.boot.workspace_sidebar_item.pages.find(p => p.name === item.name || p.title === item.label);
                if (found_page && found_page.icon) {
                    icon_val = found_page.icon;
                }
            }

            if (debug_mode) console.log(`   -> Final Icon Logic: ${icon_val}`);

            // Shortcuts Fallback
            if ((!icon_val || icon_val === 'folder' || icon_val === 'shortcut') && item.type === 'shortcut' && item.route && frappe.boot && frappe.boot.doctype_icons) {
                let parts = item.route.split('/');
                let slug = parts[parts.length - 1];
                if (slug && frappe.boot.doctype_icons[slug]) {
                    icon_val = frappe.boot.doctype_icons[slug];
                }
            }

            // Letter Fallback
            if (item.use_letter || !icon_val || icon_val === 'folder') {
                let letter = '?';
                if (frappe.get_abbr) {
                    letter = frappe.get_abbr(item.label || item.name);
                } else if (item.label || item.name) {
                    letter = (item.label || item.name).charAt(0).toUpperCase();
                }
                return `<div class="slim-text-tile"><span class="slim-text-icon">${letter}</span></div>`;
            }

            // 1. Force Overrides by Workspace NAME (Highest Priority)
            // Fixes "Subcontracting" sharing the same DB icon key ("organization") as Manufacturing
            if (item.name === 'Subcontracting') {
                return `<img src="/assets/erpnext/desktop_icons/subcontracting.svg" class="slim-svg-icon" style="width: 20px; height: 20px;">`;
            }
            if (item.name === 'Build') {
                // The "Build" workspace (separate from Frappe Builder)
                return `<img src="/assets/frappe/icons/desktop_icons/subtle/build.svg" class="slim-svg-icon" style="width: 20px; height: 20px;">`;
            }

            // Explicit File Mapping for ERPNext Modules (Preserve "Gold Bars", etc.)
            const SVG_MAP = {
                // Key = Icon Name in Database | Value = Verified File Path
                'assets': '/assets/erpnext/desktop_icons/asset.svg',
                'asset': '/assets/erpnext/desktop_icons/asset.svg',
                'buying': '/assets/erpnext/desktop_icons/buying.svg',
                'sell': '/assets/erpnext/desktop_icons/selling.svg',
                'selling': '/assets/erpnext/desktop_icons/selling.svg',
                'stock': '/assets/erpnext/desktop_icons/stock.svg',
                'hr': '/assets/erpnext/desktop_icons/hr.svg',
                'organization': '/assets/erpnext/desktop_icons/manufacturing.svg',
                'manufacturing': '/assets/erpnext/desktop_icons/manufacturing.svg',
                'crm': '/assets/erpnext/desktop_icons/crm.svg',
                'project': '/assets/erpnext/desktop_icons/projects.svg',
                'projects': '/assets/erpnext/desktop_icons/projects.svg',
                'quality': '/assets/erpnext/desktop_icons/quality.svg',
                'support': '/assets/erpnext/desktop_icons/support.svg',
                'accounts': '/assets/erpnext/desktop_icons/accounting.svg',
                'accounting': '/assets/erpnext/desktop_icons/accounting.svg',
                'table': '/assets/erpnext/desktop_icons/financials_reports.svg',
                'financial_reports': '/assets/erpnext/desktop_icons/financials_reports.svg',

                // Frappe Builder - Use FontAwesome Rocket as fallback for broken image
                'getting-started': 'fa fa-rocket',

                // Build Fallback
                'hammer': '/assets/frappe/icons/desktop_icons/subtle/build.svg'
            };

            // FontAwesome Validation (Standard + Builder Fix)
            if (SVG_MAP[icon_val] && SVG_MAP[icon_val].startsWith('fa ')) {
                return `<i class="${SVG_MAP[icon_val]}" style="font-size: 18px;"></i>`;
            }
            if (icon_val && (icon_val.includes('fa ') || icon_val.includes('fa-'))) {
                return `<i class="${icon_val}" style="width:auto;height:auto;"></i>`;
            }

            // Check Explicit Map (Images)
            if (SVG_MAP[icon_val]) {
                return `<img src="${SVG_MAP[icon_val]}" class="slim-svg-icon" style="width: 20px; height: 20px;">`;
            }

            // SVG Standard (Frappe Utils) - Fallback for everything else
            // This uses the symbols loaded by the system (lucide/icons.svg)
            if (frappe.utils.icon) {
                return frappe.utils.icon(icon_val, 'md');
            } else {
                return `<svg class="icon icon-md"><use href="#icon-${icon_val}"></use></svg>`;
            }
        } catch (e) {
            console.error("SlimDesk Icon Error:", e);
            return '<div class="slim-text-tile"><span class="slim-text-icon">?</span></div>';
        }
    }

    highlight_active() {
        if ($('#slim-sidebar').length === 0) return;
        let current_route_parts = frappe.get_route();
        let current_route_str = current_route_parts.join('/');
        let normalized_current = '/app/' + current_route_str;

        let best_match = null;
        let max_len = 0;
        $('#slim-sidebar .slim-icon-wrapper').each(function () {
            let $btn = $(this);
            let btn_route = $btn.attr('data-route');
            if (btn_route && normalized_current.startsWith(btn_route)) {
                if (btn_route.length > max_len) {
                    max_len = btn_route.length;
                    best_match = $btn;
                }
            }
        });
        if (best_match) {
            $('#slim-sidebar .slim-icon-wrapper').removeClass('active');
            best_match.addClass('active');
        }
    }

    open_customize_dialog() {
        const d = new frappe.ui.Dialog({
            title: 'Customize Sidebar',
            fields: [{ fieldtype: 'HTML', fieldname: 'list_editor' }],
            primary_action_label: 'Save Changes',
            primary_action: () => this.save_changes(d)
        });
    });
        this.render_sortable_list(d.fields_dict.list_editor.$wrapper, d);
d.add_custom_action('Add Shortcut', () => this.prompt_add_item(d, 'shortcut'));
d.add_custom_action('Add Workspace', () => this.prompt_add_item(d, 'workspace'));

// Restore Defaults Button (Header)
$('<button class="btn btn-xs text-muted" style="margin-left:auto; margin-right:10px;">Restore Defaults</button>')
    .insertBefore(d.header.find('.btn-modal-close'))
    .on('click', () => {
        frappe.confirm('Are you sure you want to restore the default sidebar layout?', () => {
            this.restore_defaults(d);
        });
    });


d.show();
    }

restore_defaults(dialog) {
    frappe.call({
        method: "v16_slim_desk.api.save_config",
        args: { workspaces: null },
        callback: (r) => {
            if (!r.exc) {
                this.config = null; // Clear local
                this.fetch_data(); // Re-fetch defaults
                this.render_sortable_list(dialog.fields_dict.list_editor.$wrapper, dialog);
                frappe.show_alert({ message: 'Defaults Restored', indicator: 'green' });
            }
        }
    });
}

render_sortable_list($parent, dialog) {
    $parent.html('<div class="slim-sort-list"></div>');
    const $list = $parent.find('.slim-sort-list');
    this.config.forEach((item, index) => {
        $list.append(this.get_sortable_item_html(item, index));
    });
    if (typeof Sortable !== 'undefined') {
        Sortable.create($list[0], { handle: '.slim-drag-handle', animation: 150, ghostClass: 'slim-ghost' });
    }

    const self = this;
    // Bind Remove
    $list.on('click', '.cmd-remove', function () { $(this).closest('.slim-sort-item').remove(); });

    // Bind Edit (Cmd-Edit)
    $list.on('click', '.cmd-edit', function () {
        let $row = $(this).closest('.slim-sort-item');
        let data = JSON.parse($row.attr('data-item'));
        self.prompt_edit_item(dialog, $row, data);
    });
}

get_sortable_item_html(item, index) {
    let snippet = this.get_icon_html(item);
    let icon_display = `<div class="slim-list-icon" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${snippet}</div>`;
    let type_label = item.type === 'shortcut' ? 'Shortcut' : 'Workspace';
    let item_json = JSON.stringify(item).replace(/"/g, '&quot;');
    return `
            <div class="slim-sort-item" data-item="${item_json}">
                <div class="slim-item-left">
                    <div class="slim-drag-handle">${frappe.utils.icon('drag', 'sm')}</div>
                    ${icon_display}
                    <div class="slim-item-label">${item.label} <span class="text-muted text-xs">(${type_label})</span></div>
                </div>
                <div class="slim-item-right">
                    <div class="slim-action-btn cmd-edit" title="Edit">${frappe.utils.icon('edit', 'sm')}</div>
                    <div class="slim-action-btn cmd-remove" title="Remove">${frappe.utils.icon('close', 'sm')}</div>
                </div>
            </div>
        `;
}

add_item_to_list(parent_dialog, item) {
    const $list = parent_dialog.fields_dict.list_editor.$wrapper.find('.slim-sort-list');
    $list.append(this.get_sortable_item_html(item));
}

// ...

// [Deleted Duplicate fetch_data method]

prompt_add_item(parent_dialog, type) {
    if (type === 'workspace') {
        let options = this.workspaces.map(w => w.name);
        let d = new frappe.ui.Dialog({
            title: 'Add Workspace', fields: [{ label: 'Workspace', fieldname: 'workspace', fieldtype: 'Select', options: options, reqd: 1 }],
            primary_action: (values) => {
                let w = this.workspaces.find(x => x.name === values.workspace);
                if (w) this.add_item_to_list(parent_dialog, this.workspace_to_item(w));
                d.hide();
            }
        });
        d.show();
    } else {
        // New Shortcut
        this.show_shortcut_dialog(parent_dialog);
    }
}

prompt_edit_item(parent_dialog, $row, data) {
    // Edit Shortcut
    if (data.type === 'shortcut' || true) { // allow editing workspaces too (custom icon)
        this.show_shortcut_dialog(parent_dialog, data, $row);
    }
}

show_shortcut_dialog(parent_dialog, existing_data = null, $existing_row = null) {
    let is_edit = !!existing_data;

    let d = new frappe.ui.Dialog({
        title: is_edit ? 'Edit Item' : 'Add Shortcut',
        fields: [
            {
                label: 'Link Type', fieldname: 'shortcut_type', fieldtype: 'Select',
                options: ['DocType', 'Report', 'Page', 'Custom Route'],
                default: existing_data && existing_data.link_type ? existing_data.link_type : 'DocType',
                reqd: 1
            },
            {
                label: 'DocType', fieldname: 'ref_doctype', fieldtype: 'Link', options: 'DocType',
                depends_on: 'eval:doc.shortcut_type=="DocType"',
                default: existing_data && existing_data.ref_doctype ? existing_data.ref_doctype : '',
                onchange: () => {
                    let val = d.get_value('ref_doctype');
                    if (val) {
                        if (!d.get_value('label')) d.set_value('label', val);
                        if (!d.get_value('route')) d.set_value('route', `/app/${frappe.router.slug(val)}`);
                        frappe.db.get_value('DocType', val, 'icon').then(r => {
                            if (r && r.message && r.message.icon) d.set_value('icon', r.message.icon);
                        });
                    }
                }
            },
            {
                label: 'Report', fieldname: 'ref_report', fieldtype: 'Link', options: 'Report',
                depends_on: 'eval:doc.shortcut_type=="Report"',
                default: existing_data && existing_data.ref_report ? existing_data.ref_report : '',
                onchange: () => {
                    let val = d.get_value('ref_report');
                    if (val) {
                        if (!d.get_value('label')) d.set_value('label', val);
                        frappe.db.get_value('Report', val, ['report_type', 'ref_doctype', 'is_standard'])
                            .then(r => {
                                if (r && r.message) {
                                    let report = r.message;
                                    let route = '';
                                    if (report.report_type === 'Report Builder') {
                                        route = `/app/${frappe.router.slug(report.ref_doctype)}/view/report/${val}`;
                                    } else {
                                        route = `/app/query-report/${val}`;
                                    }
                                    d.set_value('route', route);

                                    // Auto-Fetch Icon from Ref DocType
                                    if (report.ref_doctype) {
                                        frappe.db.get_value('DocType', report.ref_doctype, 'icon').then(rr => {
                                            if (rr && rr.message && rr.message.icon) d.set_value('icon', rr.message.icon);
                                        });
                                    }
                                }
                            });
                    }
                }
            },
            {
                label: 'Page', fieldname: 'ref_page', fieldtype: 'Link', options: 'Page',
                depends_on: 'eval:doc.shortcut_type=="Page"',
                default: existing_data && existing_data.ref_page ? existing_data.ref_page : '',
                onchange: () => {
                    let val = d.get_value('ref_page');
                    if (val) {
                        if (!d.get_value('label')) d.set_value('label', val);
                        d.set_value('route', `/app/${frappe.router.slug(val)}`);
                    }
                }
            },
            { label: 'Label', fieldname: 'label', fieldtype: 'Data', reqd: 1, default: existing_data ? existing_data.label : '' },
            { label: 'Route', fieldname: 'route', fieldtype: 'Data', reqd: 1, default: existing_data ? existing_data.route : '' },
            { label: 'Icon', fieldname: 'icon', fieldtype: 'Icon', default: existing_data ? existing_data.icon : '' }
        ],
        primary_action: (values) => {
            let new_item = {
                type: existing_data ? existing_data.type : 'shortcut', // preserve type
                label: values.label,
                route: values.route,
                icon: values.icon,
                use_letter: !values.icon,
                // Persist Source Metadata
                link_type: values.shortcut_type,
                ref_doctype: values.ref_doctype,
                ref_report: values.ref_report,
                ref_page: values.ref_page
            };

            if (is_edit && $existing_row) {
                $existing_row.replaceWith(this.get_sortable_item_html(new_item));
            } else {
                this.add_item_to_list(parent_dialog, new_item);
            }
            d.hide();
        }
    });

    d.show();
}

add_item_to_list(dialog, item) {
    dialog.fields_dict.list_editor.$wrapper.find('.slim-sort-list').append(this.get_sortable_item_html(item));
}

save_changes(dialog) {
    let new_config = [];
    dialog.fields_dict.list_editor.$wrapper.find('.slim-sort-item').each(function () {
        let data = $(this).attr('data-item');
        if (data) new_config.push(JSON.parse(data));
    });
    this.save_config_to_server(new_config, dialog);
}

save_config_to_server(new_config, dialog) {
    this.config = new_config;
    this.render_items();
    if (dialog) dialog.hide();
    frappe.call({
        method: "v16_slim_desk.api.save_config", args: { workspaces: new_config },
        callback: (r) => { if (!r.exc) frappe.show_alert({ message: 'Saved', indicator: 'green' }); }
    });
}
};

$(document).ready(function () { new frappe.ui.SlimDesk(); });
