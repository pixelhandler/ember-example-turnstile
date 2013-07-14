var App = Ember.Application.create({
  ready: function(){
    App.turnstileManager = App.TurnstileManager.create({
      enableLogging: true
    });
  }
});

App.IndexRoute = Ember.Route.extend({
  setupController: function( controller ){
    var manager = App.turnstileManager;
    manager.set( 'controller', controller );
    controller.send( 'state', manager.get( 'currentState.name' ) );
  },

  events: {
    coin: function( controller ){
      App.turnstileManager.send( 'coin', controller );
    },

    push: function( controller ){
      App.turnstileManager.send( 'push', controller );
    }
  }
});

App.IndexController = Ember.Controller.extend({
  totalCoins: 0,

  display: 'Please insert coin.',

  onCoin: function( display, isAccepted ){
    this.set( 'display', display );
    if( isAccepted ){
      this.incrementProperty( 'totalCoins' );
    }
  },

  onPush: function( display ){
    this.set( 'display', display );
  },

  onSetup: function( display ){
    this.set( 'display', display );
  },

  state: function( name ){
    this.set( 'currentState', name );
  }
});

App.BaseState = Ember.State.extend({
  unhandledEvent: function( manager, eventName ) {
    console.log( manager.toString() + ': unhandledEvent with name ' + eventName );
  },

  enter: function( /*manager*/ ){},

  setup: function( manager, context ){
    var controller = ( context ) ? context : manager.get('controller');
    if( controller ){
      controller.send( 'state', manager.get('currentState.name') );
      controller.send( 'onSetup', 'Please insert coin.' );
    }
  },

  exit: function( /*manager*/ ){}
});

App.TurnstileManager =  Ember.StateManager.extend({
  initialState: 'locked',

  locked: App.BaseState.extend({
    coin: function( manager, context ){
      context.send( 'onCoin', 'Payment accepted.', true );
      manager.transitionTo( 'unlocked', context );
    },

    push: function( manager, context ){
      context.send( 'onPush', 'Coin required, please insert coin.');
    }
  }),

  unlocked: App.BaseState.extend({
    setup: function( manager, context ){
      context.send( 'state', manager.get( 'currentState.name' ) );
      context.send( 'onSetup', 'Please proceed.');
    },

    coin: function( manager, context ){
      context.send( 'onCoin', 'No coin needed. Try pushing.', false );
    },

    push: function( manager, context ){
      manager.transitionTo( 'inUse', context );
    },

    inUse: App.BaseState.extend({
      setup: function( manager, context ){
        context.send( 'state', manager.get( 'currentState.name' ) );
        context.send( 'onSetup', 'Please wait.');
        Ember.run.later(function(){
          manager.transitionTo( 'locked', context );
        }, 1500);
      }
    })
  })
});
