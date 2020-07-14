import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import {
    Loading,
    Owner,
    IssueList,
    SelectCont,
    NextPage,
    PreviousPage,
    DivButtons,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true,
        issueState: 'open',
        page: 1,
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'open',
                },
            }),
        ]);
        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });
    }

    async componentDidUpdate(_, prevState) {
        const { issueState, page } = this.state;

        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        console.log('Pagina atual:', page);

        if (prevState.issueState !== issueState) {
            const [issues] = await Promise.all([
                api.get(`/repos/${repoName}/issues`, {
                    params: {
                        state: issueState,
                    },
                }),
            ]);

            this.setState({
                issues: issues.data,
                loading: false,
            });
        }

        if (prevState.page !== page) {
            this.setState({ issues: [] });

            const [apiIssues] = await Promise.all([
                api.get(`/repos/${repoName}/issues?page=${page}`),
            ]);

            console.log(typeof apiIssues.data);

            console.log(apiIssues.data.length);

            if (apiIssues.data.length == 0) {
                console.log('é 0');
                this.setState({ page: page - 1 });
            }
            this.setState({ issues: apiIssues.data });
        }
    }

    handleChange = () => {
        const select = document.getElementById('f_slc');
        const { value } = select.options[select.selectedIndex];
        this.setState({ issueState: value, issues: [] });
    };

    handleNext = () => {
        let { page } = this.state;

        page += 1;

        this.setState({ page });
    };

    handlePrevious = () => {
        const { page } = this.state;

        if (page > 1) {
            this.setState({ page: page - 1 });
        }
    };

    render() {
        const { repository, issues, loading } = this.state;
        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>

                <SelectCont>
                    <select id="f_slc" onChange={this.handleChange}>
                        <option selected disabled>
                            Filtro
                        </option>
                        <option value="open">Abertas</option>
                        <option value="all">Todas</option>
                        <option value="closed">Fechadas</option>
                    </select>
                </SelectCont>

                <DivButtons>
                    {this.state.page > 1 && (
                        <PreviousPage onClick={this.handlePrevious}>
                            Página Anterior
                        </PreviousPage>
                    )}
                    <NextPage onClick={this.handleNext}>
                        Proxima Página
                    </NextPage>
                </DivButtons>

                <IssueList>
                    {issues.map((issue) => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map((label) => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
                <DivButtons>
                    {this.state.page > 1 && (
                        <PreviousPage onClick={this.handlePrevious}>
                            Página Anterior
                        </PreviousPage>
                    )}
                    <NextPage onClick={this.handleNext}>
                        Proxima Página
                    </NextPage>
                </DivButtons>
            </Container>
        );
    }
}
