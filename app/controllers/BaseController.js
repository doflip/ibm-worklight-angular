/*jslint nomen: true */
/*jslint node: true */
/*jslint browser: true */
/*global angular, document, console, moment */
"use strict";

angular.module('yata.controllers')

.controller('BaseController', [ '$scope', '$ionicModal', 'TodoService', function($scope, $ionicModal, service) {
	$scope.titles = {
		menuTitle: "Menu",
		headerTitle: "Yata - Yet Another Todo App"
	};
	
	$scope.tasks = {
		inbox: service.getInbox(),
		projects: service.getProjects()
	};

	$scope.focus = {
		task: null,
		project: null
	};
	
	$scope.ranges = {
		past: {
			begin: null,
			end: moment().subtract('d', 1).endOf('d')
		},
		today: {
			begin: moment().startOf('d'),
			end: moment().endOf('d')
		},
		soon: {
			begin: moment().add('d', 1).startOf('d'),
			end: moment().add('w', 1).startOf('d')
		}
	};
	
	$scope.addTask = function() {
		$scope.taskModel.labels.title = "Add task";
		$scope.taskModel.labels.btn = "Add";
		$scope.taskModel.task.project = $scope.focus.project;
		$scope.taskModal.show();
	};
	
	$scope.headerBtns = {
		left: [{
			type: 'button-positive',
			content: '<i class="icon ion-navicon"></i>',
			tap: function(evt) {
				$scope.sideMenuController.toggleLeft();
			}
		}],
		right: [{
			type: 'button-positive button-icon-left ion-plus',
			content: 'Add task',
			tap: function(evt) {
				$scope.addTask();
			}
		}]
	};

	$scope.taskModel = {
		labels: {
			title: null,
			btn: null
		},
		task: {
			title: null,
			due: null,
			project: null
		}
	};
	
	$scope.saveTaskModal = function() {
		if ($scope.focus.task !== null) {
			// TODO Convert to service call
			$scope.focus.task.title = $scope.taskModel.task.title;
			if ($scope.taskModel.task.due === null) {
				$scope.focus.task.due = null;
			} else {
				$scope.focus.task.due = moment($scope.taskModel.task.due).toDate();
			}
			service.moveTask($scope.focus.task, $scope.taskModel.task.project);
		} else {
			var newTask = {
				title: $scope.taskModel.task.title
			};
			if ($scope.taskModel.task.due === null) {
				newTask.due = null;
			} else {
				newTask.due = moment($scope.taskModel.task.due).toDate();
			}
			service.addTask(newTask, $scope.taskModel.task.project);
		}
		$scope.closeTaskModal();
	};
	
	$scope.closeTaskModal = function() {
		$scope.taskModal.hide();
		$scope.taskModel.labels.title = null;
		$scope.taskModel.labels.btn = null;
		$scope.taskModel.task.title = null;
		$scope.taskModel.task.due = null;
		$scope.taskModel.task.project = null;
	};
	
	$scope.focusTask = function(task) {
		$scope.focus.task = task;
	};
	
	$scope.unfocusTask = function(task) {
		$scope.focus.task = null;
	};
	
	$scope.editTask = function(task) {
		$scope.taskModel.labels.title = "Edit task";
		$scope.taskModel.labels.btn = "Edit";
		$scope.taskModel.task.title = task.title;
		if (task.due !== null && task.due !== undefined) {
			$scope.taskModel.task.due = moment(task.due).format("YYYY-MM-DD");
		}
		$scope.taskModel.task.project = service.getProjectByTask(task);
		$scope.taskModal.show();
	};
	
	$scope.deleteTask = function(task) {
		$scope.$broadcast('deleteTask', task);
		service.deleteTask(task);
		$scope.focus.task = null;
	};
	
	$ionicModal.fromTemplateUrl('app/views/task.html', function(modal) {
		$scope.taskModal = modal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	
	$scope.$on('activeProject', function(evt, project) {
		$scope.focus.project = project;
	});
}]);