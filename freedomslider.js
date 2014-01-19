/**
 * @TODO:
 * debug buttons
 * timer function
 * test margin animation
 */
(function ( $ ) {
  $.fn.freeDomSlider = function( options ) {

    var container = $(this);
    
    var settings = $.extend({
      childrenSelector : null,
      currentPosition : null,
      currentIncrement : 0,
      nbVisibleElements : 1,
      nbElementsByIncrements : 1,
      showEffect : function (element) {
        element.show();
      },
      hideEffect : function (element, callback) {
        element.hide({complete:callback});
      },
      skipWaitingForShowEffect : false,
      nextButton : '.freedomslider-next-button',
      prevButton : '.freedomslider-prev-button',
      showPositionButtons : false,
      positionButtonsParentDiv : $(this),
      rotate : true,
    }, options );

    function Core(container, settings) {

      var core = this;
      var nbE = container.children(settings.childrenSelector).length;
      var nbVE = settings.nbVisibleElements;
      var nbEI = settings.nbElementsByIncrements;
      var maximumIncrement = Math.ceil((this.nbE - this.nbVE) / this.nbEI);
      var hide = settings.hideEffect;
      var show = settings.showEffect;
      var skipWaiting = settings.skipWaitingForShowEffect;

      var buttonsUpdateEvent = jQuery.Event("freedomsliderButtonsUpdate");

      if (settings.currentPosition != null) {
        this.cI = Math.ceil(settings.currentPosition / nbEI) - 1;
      }
      else {
        this.cI = settings.currentIncrement;
      }

      var getPositionMin = function (stepNumber) {
        return stepNumber * nbEI;
      }
      var getPositionMax = function (stepNumber) {
        return getPositionMin(stepNumber) + nbVE - 1;
      }

      this.updateButtons = function () {
        if (settings.rotate || this.cI < maximumIncrement) {
          container.children(settings.nextButton).show();
        }
        else { 
          container.children(settings.nextButton).hide();
        }
        if (settings.rotate || this.cI > 0) {
          container.children(settings.prevButton).show();
        }
        else { 
          container.children(settings.prevButton).hide();
        }
        container.trigger(buttonsUpdateEvent, new function() {         
          if (!buttonsUpdateEvent.isDefaultPrevented()) {
            container.append(container.children(settings.prevButton));
            container.append(container.children(settings.nextButton));
          }
          return {
            nextButtonIsVisible : this.cI < maximumIncrement,
            prevButtonIsVisible : this.cI > 0,
          }
        });
      }
      
      this.goToPosition = function (pos) {
        if (getPositionMax(pos) >= nbE - nbVE) {
          pos = this.cI = getPositionMin(nbVE - nbVE - 1);
          this.moveChildrensForward();
        }
        container.children(settings.childrenSelector).hide();
        container.children(settings.childrenSelector).slice(getPositionMin(pos), getPositionMax(pos)+1)
          .show()
        this.updateButtons();
      }

      this.updatePositionButtons = function (currentIndex, newIndex) {
        var positionButtons = $('#freedomslider-position-buttons');
        positionButtons.children('#freedomslider-position-button-' + currentIndex).removeClass('active');
        positionButtons.children('#freedomslider-position-button-' + newIndex).addClass('active');
      }

      this.displayForward = function () {
        for (i = getPositionMax(core.cI) + 1 ; 
             i <= (getPositionMax(core.cI) + nbEI) ;
             i++) {
          show(container.children(settings.childrenSelector).eq(i));
        }
        core.cI++;
        core.updateButtons();
      }
      this.hideForward = function () {
        for (i = getPositionMin(core.cI) ;
             i < (getPositionMin(core.cI) + nbEI);
             i++) {
          if (i + nbVE < nbE) {
            if (i - getPositionMin(this.cI) == nbEI - 1 && !skipWaiting) {
              hide(container.children(settings.childrenSelector).eq(i), {complete: this.displayForward});
            }
            else {
              hide(container.children(settings.childrenSelector).eq(i));
            }
          }
        }
        if (skipWaiting) this.displayForward();
      }
      this.displayBackward = function () {
        for (i = getPositionMin(core.cI) - 1; 
             i >= (getPositionMin(core.cI) - nbEI) ;
             i--) {
          show(container.children(settings.childrenSelector).eq(i));
        }
        core.cI--;
        core.updateButtons();
      }
      this.hideBackward = function () {
        for (i = getPositionMax(this.cI) ; 
             i > (getPositionMax(this.cI) - nbEI) ;
             i--) {
          if (i < nbE) {
            if (getPositionMax(this.cI) - i == nbEI - 1 && !skipWaiting) {
              console.log('hide complete ' + i);
              hide(container.children(settings.childrenSelector).eq(i), {complete: this.displayBackward});
            }
            else {
              console.log('hide ' + i);
              hide(container.children(settings.childrenSelector).eq(i));
            }
          }
        }
        if (skipWaiting) this.displayBackward();
      }
      this.moveChildrensForward = function () {
        container.children(settings.childrenSelector).slice(0, nbEI).appendTo(container);
      }
      this.moveChildrensBackward = function () {
        var lastBatch = nbE - nbEI;
        container.children(settings.childrenSelector).slice(lastBatch, nbE).prependTo(container);
      }
      this.stepForward = function () {
        container.children(settings.prevButton).hide();
        container.children(settings.nextButton).hide();
        if (settings.rotate) {
          this.cI--;
          this.moveChildrensForward();
        }
        else {
          this.updatePositionButtons(this.cI, this.cI+1);
        }
        this.hideForward();
      }
      this.stepBackward = function () {
        container.children(settings.prevButton).hide();
        container.children(settings.nextButton).hide();
        if (settings.rotate) {
          this.cI++;
          this.moveChildrensBackward();
        }
        else {
          this.updatePositionButtons(this.cI, this.cI-1);
        }
        this.hideBackward();
      }

      this.goToPosition(this.cI);

    }

    // Initialisation:

    if (container.children(settings.prevButton).length == 0) {
      container.append('<button class="freedomslider-prev-button">prev</button>');
    }
    if (container.children(settings.nextButton).length == 0) {
      container.append('<button class="freedomslider-next-button">next</button>');
    }
    
    var instance = new Core(container, settings);
    
    container.children(settings.nextButton).click(function() {instance.stepForward()});
    container.children(settings.prevButton).click(function() {instance.stepBackward()});

//     if (settings.showPositionButtons) {
//       var positionButtonsDiv = '<div id="freedomslider-position-buttons"></div>';
//       settings.positionButtonsParentDiv.prepend(positionButtonsDiv);
//       for (i=0;i<=maximumIncrement;i++) {
//         var id = 'freedomslider-position-button-' + i;
//         $('#freedomslider-position-buttons').append('<button id="' + id + '"></button>');
//         $('#'+id).addClass('freedomslider-position-button');
//         $('#'+id).click(function() {
//           pos = $(this).attr('id').replace('freedomslider-position-button-', '');
//           updatePositionButtons(cI, pos);
//           cI = pos;
//           goToPosition(pos);
//         });
//       }
//       updatePositionButtons(cI, cI);
//     }

  };
}(jQuery));
