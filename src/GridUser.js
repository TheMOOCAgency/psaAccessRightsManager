import React from 'react';
import ReactDataGrid from 'react-data-grid';
import './GridUser.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Editors } from "react-data-grid-addons";
import Button from '@material-ui/core/Button';
import FormDialog from './components/FormDialog'
import SnackBarError from './components/SnackBarError'
const { DropDownEditor } = Editors;

const struct_org = {};
const struct_org1 = []; 
const struct_org2 = [];

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      columns : null,
      rows : null, 
      isLoading : true,
      openedDialogDelete: false,
      deletingRow:{},
      openedWarning : false
    }
    this.getData = this.getData.bind(this);
    this.getDataStruct = this.getDataStruct.bind(this);
    this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this);
    this.sortRows = this.sortRows.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);    
    this.addRow = this.addRow.bind(this);    
    this.getCellActions = this.getCellActions.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.openWarning = this.openWarning.bind(this);
  }
  closeWarning = () => {
    this.setState({
      openedWarning: false,
    })
  }
  openWarning = () => {
    console.log('la')
    this.setState({
      openedWarning: true,
    })
  }
  closeDialog = () => {
    this.setState({
      openedDialogDelete: false,
    })
  }
  openDialog=(row)=>{
    this.setState({
      openedDialogDelete:true,
      deletingRow : row
    })
  }
  getData() {
    let columnsSorted = [
      Object.keys(this.props.dtl[0])[2], Object.keys(this.props.dtl[0])[1], Object.keys(this.props.dtl[0])[0], Object.keys(this.props.dtl[0])[6], Object.keys(this.props.dtl[0])[4], Object.keys(this.props.dtl[0])[3]
    ]
    let columnsArray = columnsSorted.map((data)=>{
      if (data === 'struct_org1') {
        return {
          key: data,
          name: data,
          editable: true,
          sortable: true,
          resizable : true,
          width: 125,
          editor: <DropDownEditor options={struct_org1} />
        }
      } else if (data === 'struct_org2') {
        return {
          key: data,
          name: data,
          editable: true,
          sortable: true,
          resizable: true,
          width: 125,
          editor: <DropDownEditor options={struct_org2} />
        }
      }else if (data === 'Uid'){
        return {
          key: data,
          name: data,
          editable: true,
          sortable: true,
          resizable: true,
          width: 150,
        }
      }else{
        return {
          key: data,
          name: data,
          sortable: true,
          resizable: true,
          width: 200
        }
      }
      
    })


    this.setState({
      columns: columnsArray,
      rows : this.props.dtl,
      struct_org: this.getDataStruct(this.props.struct_org),
      isLoading: false 
    })
  }
  getDataStruct(result) {
    Object.keys(result).map((x) => {
      if (struct_org1.indexOf(result[x].struct_org1) === -1) {
        if (result[x].struct_org1 !== undefined) {
          struct_org1.push(result[x].struct_org1)
        }

      }
      if (struct_org2.indexOf(result[x].struct_org1) === -1) {
        if (result[x].struct_org2 !== '' && result[x].struct_org2 !== undefined) {
          struct_org2.push(result[x].struct_org2)
        }
      }
    })

    struct_org1.map((x) => {
      Object.keys(result).map((x2) => {
        if (x === result[x2].struct_org1) {
          if (struct_org[x] === undefined) {
            struct_org[x] = []
          }
          if (result[x2].struct_org2 != '' || result[x2].struct_org2 !== undefined) {
            struct_org[x].push(result[x2].struct_org2)
          }
        }
      })
    })
    for (var property in struct_org) {
      struct_org[property].push('');
    }

    struct_org[''] = [...struct_org2]
    struct_org['-ALL'] = [...struct_org2]
    struct_org1.push('-ALL')
    struct_org2.push('')
    struct_org1.sort()
    struct_org2.sort()
    


  }
  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    if (Object.keys(updated)[0] === "Uid"){
      this.closeWarning();
      let count = false;
      for (let i = 1; i < this.props.cultureDigital.length; i++) {
        if (this.props.cultureDigital[i].Uid === updated.Uid){
          count = true;
          let newUser = {
            Uid: this.props.cultureDigital[i].Uid,
            email: this.props.cultureDigital[i].email,
            first_name: this.props.cultureDigital[i].first_name,
            last_name: this.props.cultureDigital[i].last_name,
            role: this.props.cultureDigital[i].role,
            struct_org1: "",
            struct_org2: ""
          }
          this.setState(state => {
            const rows = state.rows.slice();
            for (let i = fromRow; i <= toRow; i++) {
              rows[i] = { ...rows[i], ...newUser };
            }
            return { rows };
          });
        }
      
      }
      if(!count){
        count = false;
        this.setState({
          openedWarning : true
        })
        
      }
    }else{
      this.setState(state => {
        const rows = state.rows.slice();
        for (let i = fromRow; i <= toRow; i++) {
          rows[i] = { ...rows[i], ...updated };
        }
        return { rows };
      });
    }

  };
  addRow(){
    let canvGrid = document.getElementsByClassName("react-grid-Canvas")[0];
    canvGrid.scrollTop = 0;
    let newRows = [...this.state.rows]
    newRows.unshift({})
    this.setState(prevState => ({
      rows: newRows
    }))
  }

  sortRows = (initialRows, sortColumn, sortDirection) =>{
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    };
    return sortDirection === "NONE" ? initialRows : [...initialRows].sort(comparer);
  };
  deleteRow (row){
    this.setState(prevState => ({
      rows: [...prevState.rows.slice(0, this.state.rows.indexOf(row)), ...prevState.rows.slice(this.state.rows.indexOf(row) + 1)]
    }))
  }
  getCellActions(column, row) {
    const firstNameActions = [
      {
        icon: <span className="glyphicon glyphicon-remove" />,
        callback: ()=>{
          this.openDialog(row)
        }
      }
    ]
    const cellActions = {
      Uid: firstNameActions
    };
    return cellActions[column.key];
  }
  handleSubmit() {
    let formData = new FormData();
    formData.append('data', JSON.stringify(this.state.rows))
    fetch(window.location.href, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': window.props.csrfToken
      },
      body: formData,
    })
  }
  componentWillMount() {
    this.setState({ isLoading: true });
    this.getData(this.props.dtl)
  
  }
  componentDidMount(){
    const comparer = (a, b) => {
      return a['last_name'] > b['last_name'] ? 1 : -1;
    };
    this.setState({
      rows:[...this.state.rows].sort(comparer)
    })
  }
  render(){
    let gridData;
      if (this.state.isLoading) {
        gridData = <div className='circularProgress'><CircularProgress color="primary" /></div>
      }else{
          gridData = 
            <div className='gridData'>
              <h1>DTL Listing</h1>
            <Button onClick={this.handleSubmit} color="primary" variant="contained" id='buttonValidate'>
              Valider
            </Button>
            <Button onClick={this.addRow} color="primary" variant="contained" id='addingRowButton'>
              Ajouter un utilisateur
            </Button>
            <ReactDataGrid 
              ref={(datagrid) => { this.refGrid = datagrid; }}
              columns={this.state.columns}
              rowGetter={i => this.state.rows[i]}
              rowsCount={this.state.rows.length}
              onGridRowsUpdated={this.onGridRowsUpdated}
              enableCellSelect={true}
              minHeight={520}
              headerRowHeight={50}
              getCellActions={this.getCellActions}
              onGridSort={(sortColumn, sortDirection) => {
               this.setState({
                 rows: this.sortRows(this.state.rows, sortColumn, sortDirection)
               })
              }

              } />
            <FormDialog
              open={this.state.openedDialogDelete}
              handleClose={this.closeDialog}
              handleClickOpen={this.openDialog}
              handleDeleteRow={this.deleteRow}
              deletingRow={this.state.deletingRow}
            />
            <SnackBarError
              open={this.state.openedWarning}
              handleClose={this.closeWarning}
            />
          </div>

      }
      return (
        <div className="App">
           {gridData}
       </div>
      );
   }
  }
export default App;