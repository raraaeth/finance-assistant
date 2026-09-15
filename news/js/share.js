/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/share.js
   Version : 1.0.0

   Description :
   Article Share Controller.

   Handles :
   - Web Share API
   - Share title
   - Share description
   - Share article URL
   - Copy article URL fallback
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const SHARE_CONFIG = {

    buttonText:
        "Bagikan Artikel",

    copiedText:
        "Link berhasil disalin",

    errorText:
        "Gagal membagikan artikel"

};


/* =====================================================
   CREATE SHARE HTML
===================================================== */

export function buildShareHTML(){

    return `

        <div
            class="news-article-share"
        >

            <button
                type="button"
                class="news-article-share-button"
                id="newsArticleShareButton"
                aria-label="Bagikan artikel"
            >

                <span
                    class="news-article-share-icon"
                    aria-hidden="true"
                >

                    ↗

                </span>


                <span
                    class="news-article-share-text"
                >

                    ${SHARE_CONFIG.buttonText}

                </span>

            </button>

        </div>

    `;

}


/* =====================================================
   BIND SHARE BUTTON
===================================================== */

export function bindShareButton(
    article
){

    const button =
        document.getElementById(
            "newsArticleShareButton"
        );


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        () => {

            handleShare(
                article
            );

        }
    );

}


/* =====================================================
   HANDLE SHARE
===================================================== */

async function handleShare(
    article
){

    const shareData =
        createShareData(
            article
        );


    /*
     * Gunakan native share
     * jika tersedia.
     */

    if(
        navigator.share
    ){

        try{

            await navigator.share(
                shareData
            );

            return;

        }catch(
            error
        ){

            /*
             * User membatalkan
             * share sheet.
             *
             * Tidak perlu menampilkan
             * pesan error.
             */

            if(
                error &&
                error.name ===
                "AbortError"
            ){

                return;

            }

        }

    }


    /*
     * Fallback:
     * salin link artikel.
     */

    await copyArticleURL(
        shareData.url
    );

}


/* =====================================================
   CREATE SHARE DATA
===================================================== */

function createShareData(
    article
){

    const title =
        article.title ||
        "Finance Assistant";


    const description =
        getArticleDescription(
            article
        );


    const url =
        getArticleURL(
            article.slug
        );


    return {

        title:
            title,

        text:
            description
                ? `${title}\n\n${description}`
                : title,

        url:
            url

    };

}


/* =====================================================
   ARTICLE DESCRIPTION
===================================================== */

function getArticleDescription(
    article
){

    /*
     * Prioritas utama:
     * SEO description.
     */

    if(
        article.seo &&
        article.seo.description
    ){

        return article.seo.description;

    }


    /*
     * Fallback:
     * ambil pembuka artikel.
     */

    if(
        article.content
    ){

        const temp =
            document.createElement(
                "div"
            );


        temp.innerHTML =
            article.content;


        const text =
            temp.textContent
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        if(
            text
        ){

            return truncateText(
                text,
                240
            );

        }

    }


    return "";

}


/* =====================================================
   ARTICLE URL
===================================================== */

function getArticleURL(
    slug
){

    const relativeURL =
        `/news/${encodeURIComponent(slug)}`;


    return new URL(
        relativeURL,
        window.location.origin
    ).href;

}


/* =====================================================
   COPY ARTICLE URL
===================================================== */

async function copyArticleURL(
    url
){

    try{

        if(
            navigator.clipboard &&
            navigator.clipboard.writeText
        ){

            await navigator.clipboard.writeText(
                url
            );

            showShareStatus(
                SHARE_CONFIG.copiedText
            );

            return;

        }


        /*
         * Fallback untuk browser
         * yang tidak menyediakan
         * Clipboard API.
         */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            url;


        textarea.setAttribute(
            "readonly",
            ""
        );


        textarea.style.position =
            "fixed";


        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        showShareStatus(
            SHARE_CONFIG.copiedText
        );

    }catch(
        error
    ){

        showShareStatus(
            SHARE_CONFIG.errorText
        );

    }

}


/* =====================================================
   SHARE STATUS
===================================================== */

function showShareStatus(
    message
){

    const button =
        document.getElementById(
            "newsArticleShareButton"
        );


    if(
        !button
    ){

        return;

    }


    const textElement =
        button.querySelector(
            ".news-article-share-text"
        );


    if(
        !textElement
    ){

        return;

    }


    const originalText =
        textElement.textContent;


    textElement.textContent =
        message;


    window.setTimeout(
        () => {

            if(
                textElement
            ){

                textElement.textContent =
                    originalText;

            }

        },
        2000
    );

}


/* =====================================================
   TRUNCATE TEXT
===================================================== */

function truncateText(
    text,
    maxLength
){

    if(
        text.length <=
        maxLength
    ){

        return text;

    }


    const shortened =
        text
            .slice(
                0,
                maxLength
            )
            .replace(
                /\s+\S*$/,
                ""
            );


    return (
        shortened.trim() +
        "…"
    );

}
