
export default class Vis {

  constructor() {

    this.sortBy               = 'sort-name';
    this.highlightCurrentTeam = false;

  }

  setSortBy(val) {
    this.sortBy = val;
    this.reset();
  }

  setHighlightCurrentTeam(val) {
    this.highlightCurrentTeam = !!val;
    this.reset();
  }

  reset() { }

}
