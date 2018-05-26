"use string";

import $ from 'jquery';

import MainMenuView from './views/main_menu';
import LoginView from './views/login';
import RegisterView from './views/register';
import TournamentListView from './views/tournament_list';
import EventListView from './views/event_list';
import CreateTournamentView from './views/create_tournament';
import CreateEventView from './views/create_event';
import TournamentDetailView from './views/tournament_detail';
import EventDetailView from './views/event_detail';
import RoundDetailView from './views/round_detail';
import ListUsersView from './views/list_users';
import TemplateListView from './views/template_list';
import CreateTournamentTemplateView from './views/create_tournament_template';
import UserProfileView from './views/user_profile';
import CreatePlayerView from './views/create_player';
import DeveloperView from './views/developer';

import ProgressDialog from './views/dialogs/progress_dialog';
import InvitePlayersDialog from './views/dialogs/invite_players_dialog';
import SingleInputDialog from './views/dialogs/single_input_dialog';
import MovePlayerDialog from './views/dialogs/move_player_dialog';
import SeatPlayerDialog from './views/dialogs/seat_player_dialog';
import ConfirmDialog from './views/dialogs/confirm_dialog';
import DeleteModelDialog from './views/dialogs/delete_model_dialog';
import PasswordChangedDialog from './views/dialogs/password_changed_dialog';
import PrintScoreSheetsDialog from './views/dialogs/print_score_sheets_dialog';
import SelectEventTemplateDialog from './views/dialogs/select_event_template_dialog';

export default class Router {

  constructor() {
    this.active_view = null;
    this.active_dialog = null;
    this.last_views = [];

    console.log("ROUTER::CONSTRUCTOR");

    this.menu_view = new MainMenuView();

    this.routes = {
      "login": LoginView,
      "register": RegisterView,
      "tournament_list": TournamentListView,
      "event_list": EventListView,
      "create_tournament": CreateTournamentView,
      "create_event": CreateEventView,
      "tournament_detail": TournamentDetailView,
      "event_detail": EventDetailView,
      "round_detail": RoundDetailView,
      "list_users": ListUsersView,
      "template_list": TemplateListView,
      "create_tournament_template": CreateTournamentTemplateView,
      "user_profile": UserProfileView,
      "create_player": CreatePlayerView,
      "developer": DeveloperView
    }

    this.dialogs = {
      "progress_dialog": ProgressDialog,
      "invite_players_dialog": InvitePlayersDialog,
      "single_input_dialog": SingleInputDialog,
      "move_player": MovePlayerDialog,
      "seat_player": SeatPlayerDialog,
      "confirm_action": ConfirmDialog,
      "delete_model": DeleteModelDialog,
      "password_changed": PasswordChangedDialog,
      "print_score_sheets": PrintScoreSheetsDialog,
      "select_event_template": SelectEventTemplateDialog
    }
  }

  navigate(view_name, options, ...args) {
    let _options = options || {};

    if(this.active_view) {
      this.active_view.unload();
    }

    if(view_name == "back" && this.last_views.length > 0) {
      this.active_view = this.last_views.pop();

    } else {
      let replace = _options.replace || false;

      if(!replace && this.active_view)
        this.last_views.push(this.active_view);

      this.active_view = this._get_view_for_viewname(view_name, args);
    }

    console.log("Rendering Main Menu");
    $("#main-menu").empty();
    this.menu_view.render($("#main-menu"));

    console.log("Rendering Active View");
    $("#login-content").empty();
    $("#content").empty();

    if(view_name == 'login' || view_name == 'register') {
      $("#login-content").css('display', 'block');
    } else {
      $("#login-content").css('display', 'none');
    }
    this.active_view.render($(this.active_view.container));
  }

  open_dialog(dialog_name, ...args) {
    if(this.active_dialog) {
      this.active_dialog.close();
      this.active_dialog.unload();

      $("[role='dialog']").remove();
    }

    this.active_dialog = this._get_dialog_for_dialog_name(dialog_name, args);

    console.log("Rendering Active Dalog");
    $("#dialog").empty();
    this.active_dialog.render($("#dialog"));
    this.active_dialog.open();
  }

  _get_view_for_viewname(view_name, args) {
    return new this.routes[view_name](...args);
  }

  _get_dialog_for_dialog_name(dialog_name, args) {
    return new this.dialogs[dialog_name](...args);
  }
}
