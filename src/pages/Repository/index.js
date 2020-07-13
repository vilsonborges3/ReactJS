import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Loading, Owner, IssueList, TypeList } from './styles';
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
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'open',
                    per_page: 5,
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
        const { issueState } = this.state;

        if (prevState.issueState !== issueState) {
            console.log('caiu no up');

            const { match } = this.props;

            const repoName = decodeURIComponent(match.params.repository);

            const [issues] = await Promise.all([
                api.get(`/repos/${repoName}/issues`, {
                    params: {
                        state: issueState,
                        per_page: 5,
                    },
                }),
            ]);

            this.setState({
                issues: issues.data,
                loading: false,
            });
        }
    }

    handleChange = () => {
        const select = document.getElementById('f_slc');
        const { value } = select.options[select.selectedIndex];
        this.setState({ issueState: value, issues: [] });
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

                <TypeList>
                    <select id="f_slc" onChange={this.handleChange}>
                        <option value="all">Todas</option>
                        <option value="open">Abertas</option>
                        <option value="closed">Fechadas</option>
                    </select>
                </TypeList>

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
            </Container>
        );
    }
}
