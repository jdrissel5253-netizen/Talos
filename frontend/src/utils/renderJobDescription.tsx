import React from 'react';
import styled from 'styled-components';

export const DescSection = styled.div`
    margin-bottom: 1.25rem;
    &:last-child { margin-bottom: 0; }
`;

export const DescSectionHeader = styled.h3`
    font-size: 0.9rem;
    font-weight: 700;
    color: #e0e0e0;
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
`;

export const DescParagraph = styled.p`
    color: #a3a3a3;
    font-size: 0.88rem;
    line-height: 1.75;
    margin: 0 0 0.5rem;
    &:last-child { margin-bottom: 0; }
`;

export const DescBulletList = styled.ul`
    list-style: disc;
    padding-left: 1.25rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
`;

export const DescBulletItem = styled.li`
    color: #a3a3a3;
    font-size: 0.88rem;
    line-height: 1.6;
`;

const SECTION_HEADERS = new Set([
    'About This Role', 'Responsibilities', 'Qualifications',
    'Requirements', 'Preferred', 'What We Offer',
    'Advancement Opportunities', 'Benefits',
]);

function preprocess(text: string): string {
    let t = text;
    SECTION_HEADERS.forEach(h => {
        t = t.replace(new RegExp(`(?<![\\n])${h}`, 'g'), `\n${h}`);
    });
    t = t.replace(/ • /g, '\n• ');
    return t;
}

export function renderJobDescription(text: string): React.ReactNode {
    if (!text) return null;
    text = preprocess(text);

    type Child = { type: 'para' | 'bullet'; text: string };
    type SectionBlock = { kind: 'section'; heading: string; children: Child[] };
    type ParaBlock = { kind: 'para'; text: string };
    type Block = SectionBlock | ParaBlock;

    const blocks: Block[] = [];
    let current: SectionBlock | null = null;

    for (const rawLine of text.split('\n')) {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed === '---') continue;
        const stripped = trimmed.replace(/^#+\s*/, '');

        if (SECTION_HEADERS.has(stripped)) {
            current = { kind: 'section', heading: stripped, children: [] };
            blocks.push(current);
            continue;
        }

        const isBullet = /^[•\-\*]\s+/.test(trimmed);
        const itemText = isBullet ? trimmed.replace(/^[•\-\*]\s+/, '') : trimmed;

        if (current) {
            current.children.push({ type: isBullet ? 'bullet' : 'para', text: itemText });
        } else if (isBullet) {
            const last = blocks[blocks.length - 1];
            if (last?.kind === 'section') {
                last.children.push({ type: 'bullet', text: itemText });
            } else {
                const s: SectionBlock = { kind: 'section', heading: '', children: [{ type: 'bullet', text: itemText }] };
                blocks.push(s);
                current = s;
            }
        } else {
            blocks.push({ kind: 'para', text: trimmed });
        }
    }

    return (
        <>
            {blocks.map((block, i) => {
                if (block.kind === 'para') {
                    return <DescParagraph key={i}>{block.text}</DescParagraph>;
                }
                const bullets = block.children.filter(c => c.type === 'bullet');
                const paras   = block.children.filter(c => c.type === 'para');
                return (
                    <DescSection key={i}>
                        {block.heading && <DescSectionHeader>{block.heading}</DescSectionHeader>}
                        {paras.map((p, j)   => <DescParagraph key={`p-${j}`}>{p.text}</DescParagraph>)}
                        {bullets.length > 0 && (
                            <DescBulletList>
                                {bullets.map((b, j) => <DescBulletItem key={`b-${j}`}>{b.text}</DescBulletItem>)}
                            </DescBulletList>
                        )}
                    </DescSection>
                );
            })}
        </>
    );
}
