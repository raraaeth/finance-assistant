/* =====================================================
   Finance Assistant
   Component   : Profile
   File        : createworkspace.js
   Version     : 1.0.0

   Description :
   Create Workspace UI

   Responsibility :
   ------------------------------------------
   - Menampilkan pilihan Workspace
   - Menyembunyikan Workspace yang tidak tersedia
   - Konfirmasi pembuatan Workspace
   - Menampilkan pesan custom
   - Tidak menangani proses pembuatan Workspace

   Tidak menangani :
   - Workspace state
   - Google Auth
   - Google Drive
   - Google Sheets
   - Apps Script

   Proses creation tetap ditangani oleh:
       addworkspace.js
===================================================== */


/* =====================================================
   STATE
===================================================== */

const CreateWorkspaceState = {

    overlay : null,

    loading : false

};


/* =====================================================
   REMOVE OVERLAY
===================================================== */

function removeOverlay(){

    if(

        CreateWorkspaceState.overlay

    ){

        CreateWorkspaceState.overlay.remove();

        CreateWorkspaceState.overlay =

            null;

    }


    CreateWorkspaceState.loading =

        false;

}


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createOverlay(){

    removeOverlay();


    const overlay =

        document.createElement(

            "div"

        );


    overlay.className =

        "create-workspace-overlay";


    overlay.addEventListener(

        "click",

        event => {

            if(

                event.target === overlay

            ){

                removeOverlay();

            }

        }

    );


    document.body.appendChild(

        overlay

    );


    CreateWorkspaceState.overlay =

        overlay;


    return overlay;

}


/* =====================================================
   WORKSPACE PICKER
===================================================== */

export function openWorkspacePicker(

    available = [],

    onSelect = null

){

    if(

        !Array.isArray(

            available

        )

        ||

        !available.length

    ){

        showWorkspaceMessage(

            "Semua Workspace sudah dibuat."

        );

        return;

    }


    const overlay =

        createOverlay();


    overlay.innerHTML =

    `

        <div

            class="create-workspace-sheet"

            role="dialog"

            aria-modal="true"

            aria-labelledby="create-workspace-title"

        >

            <div class="create-workspace-handle"></div>


            <div class="create-workspace-header">

                <h2

                    id="create-workspace-title"

                >

                    Create Workspace

                </h2>


                <button

                    class="create-workspace-close"

                    type="button"

                    aria-label="Tutup"

                >

                    ×

                </button>

            </div>


            <p class="create-workspace-description">

                Pilih workspace yang ingin dibuat.

            </p>


            <div class="create-workspace-list">

                ${

                    available

                        .map(

                            createWorkspaceOption

                        )

                        .join(

                            ""

                        )

                }

            </div>


            <button

                class="create-workspace-cancel"

                type="button"

            >

                Batal

            </button>

        </div>

    `;


    bindPickerEvents(

        overlay,

        available,

        onSelect

    );

}


/* =====================================================
   WORKSPACE OPTION
===================================================== */

function createWorkspaceOption(

    module

){

    return `

        <button

            class="create-workspace-option"

            type="button"

            data-workspace-id="${escapeHtml(

                module.id

            )}"

        >

            <span class="create-workspace-option-left">

                <span class="create-workspace-option-icon">

                    ${module.icon || "📁"}

                </span>


                <span class="create-workspace-option-info">

                    <strong>

                        ${escapeHtml(

                            module.title

                        )}

                    </strong>


                    <small>

                        Buat Workspace

                    </small>

                </span>

            </span>


            <span class="create-workspace-option-arrow">

                ›

            </span>

        </button>

    `;

}


/* =====================================================
   PICKER EVENTS
===================================================== */

function bindPickerEvents(

    overlay,

    available,

    onSelect

){

    const closeButton =

        overlay.querySelector(

            ".create-workspace-close"

        );


    const cancelButton =

        overlay.querySelector(

            ".create-workspace-cancel"

        );


    if(

        closeButton

    ){

        closeButton.addEventListener(

            "click",

            removeOverlay

        );

    }


    if(

        cancelButton

    ){

        cancelButton.addEventListener(

            "click",

            removeOverlay

        );

    }


    const options =

        overlay.querySelectorAll(

            "[data-workspace-id]"

        );


    options.forEach(

        option => {

            option.addEventListener(

                "click",

                () => {

                    const module =

                        available.find(

                            item =>

                                item.id ===

                                option.dataset.workspaceId

                        );


                    if(

                        !module

                    ){

                        return;

                    }


                    openWorkspaceConfirmation(

                        module,

                        onSelect

                    );

                }

            );

        }

    );

}


/* =====================================================
   CONFIRMATION
===================================================== */

function openWorkspaceConfirmation(

    module,

    onSelect

){

    const overlay =

        CreateWorkspaceState.overlay;


    if(

        !overlay

    ){

        return;

    }


    overlay.innerHTML =

    `

        <div

            class="create-workspace-sheet create-workspace-confirm-sheet"

            role="dialog"

            aria-modal="true"

            aria-labelledby="create-workspace-confirm-title"

        >

            <div class="create-workspace-handle"></div>


            <div class="create-workspace-confirm-icon">

                ${module.icon || "📁"}

            </div>


            <h2

                id="create-workspace-confirm-title"

                class="create-workspace-confirm-title"

            >

                Buat Workspace?

            </h2>


            <p class="create-workspace-confirm-text">

                Kamu akan membuat Workspace

                <strong>

                    ${escapeHtml(

                        module.title

                    )}

                </strong>.

            </p>


            <div class="create-workspace-actions">

                <button

                    class="create-workspace-action secondary"

                    type="button"

                    data-action="cancel"

                >

                    Batal

                </button>


                <button

                    class="create-workspace-action primary"

                    type="button"

                    data-action="confirm"

                >

                    Buat

                </button>

            </div>

        </div>

    `;


    const cancelButton =

        overlay.querySelector(

            '[data-action="cancel"]'

        );


    const confirmButton =

        overlay.querySelector(

            '[data-action="confirm"]'

        );


    if(

        cancelButton

    ){

        cancelButton.addEventListener(

            "click",

            () => {

                openWorkspacePicker(

                    [

                        module

                    ],

                    onSelect

                );

            }

        );

    }


    if(

        confirmButton

    ){

        confirmButton.addEventListener(

            "click",

            async () => {

                if(

                    CreateWorkspaceState.loading

                ){

                    return;

                }


                CreateWorkspaceState.loading =

                    true;


                confirmButton.disabled =

                    true;


                confirmButton.textContent =

                    "Membuat...";


                try{

                    if(

                        typeof onSelect ===

                        "function"

                    ){

                        await onSelect(

                            module

                        );

                    }

                }catch(error){

                    CreateWorkspaceState.loading =

                        false;


                    confirmButton.disabled =

                        false;


                    confirmButton.textContent =

                        "Buat";


                    throw error;

                }

            }

        );

    }

}


/* =====================================================
   WORKSPACE MESSAGE
===================================================== */

export function showWorkspaceMessage(

    message

){

    const overlay =

        createOverlay();


    overlay.innerHTML =

    `

        <div

            class="create-workspace-sheet create-workspace-message-sheet"

            role="dialog"

            aria-modal="true"

            aria-labelledby="workspace-message-title"

        >

            <div class="create-workspace-handle"></div>


            <div class="create-workspace-message-icon">

                ℹ️

            </div>


            <h2

                id="workspace-message-title"

                class="create-workspace-confirm-title"

            >

                Informasi

            </h2>


            <p class="create-workspace-confirm-text">

                ${escapeHtml(

                    message

                )}

            </p>


            <button

                class="create-workspace-message-button"

                type="button"

            >

                Oke

            </button>

        </div>

    `;


    const button =

        overlay.querySelector(

            ".create-workspace-message-button"

        );


    if(

        button

    ){

        button.addEventListener(

            "click",

            removeOverlay

        );

    }

}


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(

    "keydown",

    event => {

        if(

            event.key !== "Escape"

        ){

            return;

        }


        if(

            CreateWorkspaceState.overlay

        ){

            removeOverlay();

        }

    }

);


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(

    value

){

    return String(

        value

        ||

        ""

    )

    .replace(

        /&/g,

        "&amp;"

    )

    .replace(

        /</g,

        "&lt;"

    )

    .replace(

        />/g,

        "&gt;"

    )

    .replace(

        /"/g,

        "&quot;"

    )

    .replace(

        /'/g,

        "&#039;"

    );

}


/* =====================================================
   EXPORT
===================================================== */

export {

    removeOverlay

};
