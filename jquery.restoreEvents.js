/**
 * jQuery-Plugin that stores and restores Events attached to jQuery-Elements
 * To reduce the global impact this might have it's possible to use jQuery's event-namespacing
 *
 * Use:    Helpful if you have to temporarily unbind behavior which
 *         you want to restore later on. For example you have some keyboard
 *         shortcuts which should be temporarily deactivated when a modal
 *         window is active.
 *
 * Caveat: This only works with events registered through jQuery.
 *         There is no elegant way to store/restore events added through the
 *         browser's native addEventListener(). It is possible
 *         but the code is really messy. See here for example:
 *         http://stackoverflow.com/questions/446892/how-to-find-event-listeners-on-a-dom-node
 *
 * @author Philip Paetz <philip.paetz@me.com>
 * @version 1.0
 */

(function($){

    $.fn.extend({

        // store events attached to a jQuery element
        storeEvents: function(namespace, eventFilter){
            this.each(function(){

                var events = {};

                if (namespace) {

                    // If namespace is provided, buffer attached events to allEvents
                    var allEvents = jQuery._data($(this)[0], 'events');

                    // Iterate over allEvents and fetch events that match namespace
                    for (var eventGroup in allEvents) {
                        if (allEvents.hasOwnProperty(eventGroup)) {
                            events[eventGroup] = [];
                            for(var event in allEvents[eventGroup]){
                                if (allEvents[eventGroup].hasOwnProperty(event)) {

                                    // If event matches namespace…
                                    if(allEvents[eventGroup][event].namespace){

                                        // …push matching events into the events-object
                                        events[eventGroup].push(allEvents[eventGroup][event]);
                                    }
                                }
                            }
                        }
                    }
                } else {

                    // If no namespace is provided, store all events
                    // We take advantage of jQuery's $.extend(deep=true, …)
                    // because we need to recursively copy the whole events-object
                    events = $.extend(true, {},  jQuery._data($(this)[0], 'events'));
                }

                // Filter out events not included in the function parameters, if provided
                // There is probably a better way to do this
                if(eventFilter) {
                    for (var eventName in events ) {
                        if (eventFilter.indexOf(eventName) < 0) {
                            delete events[eventName];
                        }
                    }
                }
                // Store events in the data-attribute of the relevant element
                $(this).data('storedEvents', events);

            });
            return this;
        },

        // Restore events attached to the elements data-attribute (if present)
        restoreEvents: function(namespace){
            this.each(function(){

                // Fetch stored elements from data-attribute
                var events = $(this).data('storedEvents');

                if (events){
                    for (var type in events){
                        for (var handler in events[type]){
                            $.event.add(
                                this,
                                type,
                                events[type][handler],
                                events[type][handler].data);
                        }
                    }
                }
            });
            return this;
        }
    });
})(jQuery);
