/**
 * Copyright 2015, 2016 Ori Livneh <ori@wikimedia.org>
 *
 * Licensed under the Apache License, Version 2.0 ( the "License" );
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
( function () {
    'use strict';

    // Equivalent to `mw.config.get( 'wgRequestId' )`. We have to scrape the value
    // from the script source because Chrome extension content scripts do not share
    // an execution environment with other JavaScript code.
    function getRequestId() {
        var nodes = document.querySelectorAll( 'script' ), i, match;

        for ( i = 0; i < nodes.length; i++ ) {
            match = /"wgRequestId":\s*"([^"]+)"/.exec( nodes[i].innerText );
            if ( match ) {
                return match[1];
            }
        }
    }

    // Insert an item to the footer menu at the bottom of the page.
    function addFooterPlace( caption, url ) {
        var a, li, ul;

        a = document.createElement( 'a' );
        a.className = 'noprint';
        a.href = url;
        a.innerText = caption;

        li = document.createElement( 'li' );
        li.id = 'footer-places-' + caption.toLowerCase().replace( /\W/g, '-' );
        li.appendChild( a );

        ul = document.querySelector( '#footer-places, .footer-places' );
        if ( ul ) {
            ul.appendChild( li );
        }
    }

    chrome.runtime.sendMessage( { action: 'get' }, function ( response ) {
        var reqId;

        if ( !response.enabled || !( response.log || response.profile ) ) {
            return;
        }

        reqId = getRequestId();
        if ( !reqId ) {
            return;
        }

        if ( response.profile ) {
            addFooterPlace(
                'Profiling Data',
                'https://performance.wikimedia.org/xhgui/?url=' + reqId
            );
        }
        if ( response.log ) {
            addFooterPlace(
                'Debug Logs',
                'https://logstash.wikimedia.org/#/dashboard/elasticsearch/request-id?id=' + reqId
            );
        }
    } );

} () );
