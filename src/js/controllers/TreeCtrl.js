var _ = require('lodash');
export default class TreeCtrl {
	constructor($scope, gameManager, game, onUpdate){
		this.$scope      = $scope;
		this.gameManager = gameManager;
		this.game        = game;
		var apply = _.debounce(() => $scope.$apply());
		onUpdate.add(apply);

		this.registerStateScrollUpdate();
		this.registerDrawBounds();
		// this.registerFilter();
	}
	registerStateScrollUpdate(){
		var parent = $('.states');
		var child = parent.find('.selected');
		this.$scope.$watch(function(){
			return child = parent.find('.selected')[0];
		}, function(){
			if ($(child).offset())
			parent.animate({
				scrollTop: $(child).offset().top - parent.offset().top + parent.scrollTop()
			});
		})
	}
	registerDrawBounds(){
		var {gameManager, game} = this;
		var {state, debug}      = game;
		var render              = state.render;
		/**
		 * Rewrap the render function when it changes
		 * to add hightlighting function for $inspectorTreeSelected
		 */
		this.$scope.$watch(function(){
			return state.render === render;
		}, function() {
			render = state.render;
			/** TODO: Move the params to somewhere else */
			var min       = 0.3;
			var max       = 0.5;
			var alpha     = min;
			var direction = 1;
			var delta     = 0.005;
			/** Wrapping process */
			var _render = render;
			state.render = function(){
				_render.apply(this, arguments);
				if (!gameManager.$render) return;
				var obj = gameManager.$inspectorTreeSelected;
				if (!obj || !obj.getBounds) return;
				var bounds = obj.getBounds().offset(obj.worldTransform.tx, obj.worldTransform.ty) ;
				if (!bounds) return;
				debug.geom(bounds, `rgba(0, 191, 0, ${alpha})`);
				alpha += delta * direction;
				if (alpha > max || alpha < min) direction = -direction;
			}
		})
	}
	registerFilter(){
		var {$scope, gameManager} = this;
		$scope.$watch(() => this.search, () => {
			gameManager.filter(this.search);
		});
	}
	goToState(state){
		this.gameManager.$inspectorTreeSelected = null;
		this.game.state.start(state)
	}
}