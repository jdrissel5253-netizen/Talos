import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.regex.Pattern;

public class DemoRequestDialog extends JDialog {
    private static final Color PRIMARY_GREEN = new Color(26, 90, 58);
    private static final Color HOVER_GREEN = new Color(15, 61, 38);
    private static final Color LIGHT_GRAY = new Color(245, 247, 250);
    private static final Color BORDER_GRAY = new Color(229, 229, 229);
    private static final Color TEXT_GRAY = new Color(102, 102, 102);
    private static final Color DARK_TEXT = new Color(51, 51, 51);
    private static final Color SUCCESS_GREEN = new Color(212, 237, 218);
    private static final Color SUCCESS_TEXT = new Color(21, 87, 36);

    private JTextField fullNameField;
    private JTextField companyNameField;
    private JTextField emailField;
    private JTextField phoneField;
    private JComboBox<String> employeeCountCombo;
    private JButton submitButton;
    private JButton cancelButton;
    private JPanel formPanel;
    private JPanel successPanel;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
    );

    public DemoRequestDialog(Frame parent) {
        super(parent, "Request Your Demo - Talos HVAC", true);
        initializeDialog();
    }

    private void initializeDialog() {
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setResizable(false);

        // Main container with gradient background
        JPanel mainPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

                // Create subtle gradient
                GradientPaint gradient = new GradientPaint(0, 0, Color.WHITE,
                                                          getWidth(), getHeight(),
                                                          LIGHT_GRAY);
                g2d.setPaint(gradient);
                g2d.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        mainPanel.setLayout(new BorderLayout());
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));

        // Create form and success panels
        formPanel = createFormPanel();
        successPanel = createSuccessPanel();

        // Show form panel initially
        mainPanel.add(formPanel, BorderLayout.CENTER);

        add(mainPanel);

        // Set dialog properties
        setSize(500, 650);
        setLocationRelativeTo(getParent());

        // Focus on first field when dialog opens
        SwingUtilities.invokeLater(() -> fullNameField.requestFocusInWindow());
    }

    private JPanel createFormPanel() {
        JPanel panel = new JPanel();
        panel.setOpaque(false);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));

        // Header section
        JPanel headerPanel = createHeaderPanel();
        panel.add(headerPanel);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));

        // Form container
        JPanel formContainer = createFormContainer();
        panel.add(formContainer);

        return panel;
    }

    private JPanel createHeaderPanel() {
        JPanel headerPanel = new JPanel();
        headerPanel.setOpaque(false);
        headerPanel.setLayout(new BoxLayout(headerPanel, BoxLayout.Y_AXIS));

        // Title
        JLabel titleLabel = new JLabel("Request Your Demo");
        titleLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 28));
        titleLabel.setForeground(DARK_TEXT);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Subtitle
        JLabel subtitleLabel = new JLabel("<html><div style='text-align: center;'>" +
            "See how Talos can streamline your HVAC hiring process.<br>" +
            "Get a personalized demo tailored to your company's needs." +
            "</div></html>");
        subtitleLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        subtitleLabel.setForeground(TEXT_GRAY);
        subtitleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        headerPanel.add(titleLabel);
        headerPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        headerPanel.add(subtitleLabel);

        return headerPanel;
    }

    private JPanel createFormContainer() {
        JPanel container = new JPanel();
        container.setBackground(Color.WHITE);
        container.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 1),
            new EmptyBorder(25, 25, 25, 25)
        ));
        container.setLayout(new BoxLayout(container, BoxLayout.Y_AXIS));

        // Full Name field
        container.add(createFieldLabel("Full Name *"));
        fullNameField = createStyledTextField();
        container.add(fullNameField);
        container.add(Box.createRigidArea(new Dimension(0, 15)));

        // Company Name field
        container.add(createFieldLabel("Company Name *"));
        companyNameField = createStyledTextField();
        container.add(companyNameField);
        container.add(Box.createRigidArea(new Dimension(0, 15)));

        // Email field
        container.add(createFieldLabel("Email *"));
        emailField = createStyledTextField();
        container.add(emailField);
        container.add(Box.createRigidArea(new Dimension(0, 15)));

        // Phone field
        container.add(createFieldLabel("Phone Number *"));
        phoneField = createStyledTextField();
        container.add(phoneField);
        container.add(Box.createRigidArea(new Dimension(0, 15)));

        // Employee Count dropdown
        container.add(createFieldLabel("Employee Count *"));
        String[] employeeOptions = {
            "Select employee count...",
            "1-10 employees",
            "11-50 employees",
            "51-200 employees",
            "200+ employees"
        };
        employeeCountCombo = createStyledComboBox(employeeOptions);
        container.add(employeeCountCombo);
        container.add(Box.createRigidArea(new Dimension(0, 25)));

        // Button panel
        JPanel buttonPanel = createButtonPanel();
        container.add(buttonPanel);

        return container;
    }

    private JLabel createFieldLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 13));
        label.setForeground(DARK_TEXT);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    private JTextField createStyledTextField() {
        JTextField field = new JTextField();
        field.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        field.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 2),
            new EmptyBorder(8, 12, 8, 12)
        ));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        field.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Add focus effects
        field.addFocusListener(new java.awt.event.FocusAdapter() {
            public void focusGained(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(PRIMARY_GREEN, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }

            public void focusLost(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(BORDER_GRAY, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }
        });

        return field;
    }

    private JComboBox<String> createStyledComboBox(String[] options) {
        JComboBox<String> combo = new JComboBox<>(options);
        combo.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        combo.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 2),
            new EmptyBorder(8, 8, 8, 8)
        ));
        combo.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        combo.setAlignmentX(Component.LEFT_ALIGNMENT);
        combo.setBackground(Color.WHITE);

        // Add focus effects
        combo.addFocusListener(new java.awt.event.FocusAdapter() {
            public void focusGained(java.awt.event.FocusEvent e) {
                combo.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(PRIMARY_GREEN, 2),
                    new EmptyBorder(8, 8, 8, 8)
                ));
            }

            public void focusLost(java.awt.event.FocusEvent e) {
                combo.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(BORDER_GRAY, 2),
                    new EmptyBorder(8, 8, 8, 8)
                ));
            }
        });

        return combo;
    }

    private JPanel createButtonPanel() {
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        buttonPanel.setOpaque(false);

        cancelButton = createSecondaryButton("Cancel", this::handleCancel);
        submitButton = createPrimaryButton("Submit Request", this::handleSubmit);

        buttonPanel.add(cancelButton);
        buttonPanel.add(submitButton);

        return buttonPanel;
    }

    private JButton createPrimaryButton(String text, ActionListener action) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                if (getModel().isPressed()) {
                    g2d.setColor(HOVER_GREEN);
                } else if (getModel().isRollover()) {
                    g2d.setColor(HOVER_GREEN);
                } else {
                    g2d.setColor(PRIMARY_GREEN);
                }

                g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);

                // Draw text
                g2d.setColor(Color.WHITE);
                g2d.setFont(getFont());
                FontMetrics fm = g2d.getFontMetrics();
                int textWidth = fm.stringWidth(getText());
                int textHeight = fm.getHeight();
                int x = (getWidth() - textWidth) / 2;
                int y = (getHeight() - textHeight) / 2 + fm.getAscent();
                g2d.drawString(getText(), x, y);
            }
        };

        button.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
        button.setForeground(Color.WHITE);
        button.setBackground(PRIMARY_GREEN);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(150, 40));
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));

        button.addActionListener(action);

        return button;
    }

    private JButton createSecondaryButton(String text, ActionListener action) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                // Draw border and background
                if (getModel().isPressed()) {
                    g2d.setColor(new Color(245, 245, 245));
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                } else if (getModel().isRollover()) {
                    g2d.setColor(new Color(250, 250, 250));
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                } else {
                    g2d.setColor(Color.WHITE);
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                }

                g2d.setColor(BORDER_GRAY);
                g2d.setStroke(new BasicStroke(2));
                g2d.drawRoundRect(1, 1, getWidth()-3, getHeight()-3, 8, 8);

                // Draw text
                g2d.setColor(TEXT_GRAY);
                g2d.setFont(getFont());
                FontMetrics fm = g2d.getFontMetrics();
                int textWidth = fm.stringWidth(getText());
                int textHeight = fm.getHeight();
                int x = (getWidth() - textWidth) / 2;
                int y = (getHeight() - textHeight) / 2 + fm.getAscent();
                g2d.drawString(getText(), x, y);
            }
        };

        button.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
        button.setForeground(TEXT_GRAY);
        button.setBackground(Color.WHITE);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(100, 40));
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));

        button.addActionListener(action);

        return button;
    }

    private JPanel createSuccessPanel() {
        JPanel panel = new JPanel();
        panel.setOpaque(false);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(50, 50, 50, 50));

        // Success icon
        JLabel iconLabel = new JLabel("✓");
        iconLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 72));
        iconLabel.setForeground(PRIMARY_GREEN);
        iconLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Success title
        JLabel titleLabel = new JLabel("Demo Request Submitted!");
        titleLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 24));
        titleLabel.setForeground(DARK_TEXT);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Success message
        JLabel messageLabel = new JLabel("<html><div style='text-align: center;'>" +
            "Thank you! We'll be in touch within 24 hours<br>" +
            "to schedule your personalized demo." +
            "</div></html>");
        messageLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 16));
        messageLabel.setForeground(TEXT_GRAY);
        messageLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Close button
        JButton closeButton = createPrimaryButton("Close", e -> dispose());

        panel.add(iconLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));
        panel.add(titleLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(messageLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 30)));
        panel.add(closeButton);

        return panel;
    }

    private boolean validateForm() {
        StringBuilder errors = new StringBuilder();

        // Validate required fields
        if (fullNameField.getText().trim().isEmpty()) {
            errors.append("• Full Name is required\n");
        }

        if (companyNameField.getText().trim().isEmpty()) {
            errors.append("• Company Name is required\n");
        }

        String email = emailField.getText().trim();
        if (email.isEmpty()) {
            errors.append("• Email is required\n");
        } else if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.append("• Please enter a valid email address\n");
        }

        if (phoneField.getText().trim().isEmpty()) {
            errors.append("• Phone Number is required\n");
        }

        if (employeeCountCombo.getSelectedIndex() == 0) {
            errors.append("• Employee Count is required\n");
        }

        if (errors.length() > 0) {
            JOptionPane.showMessageDialog(this,
                "Please correct the following errors:\n\n" + errors.toString(),
                "Validation Error",
                JOptionPane.ERROR_MESSAGE);
            return false;
        }

        return true;
    }

    private void handleSubmit(ActionEvent e) {
        if (!validateForm()) {
            return;
        }

        // Disable form during submission
        submitButton.setText("Submitting...");
        submitButton.setEnabled(false);
        cancelButton.setEnabled(false);

        // Simulate submission process
        SwingUtilities.invokeLater(() -> {
            try {
                Thread.sleep(1500); // Simulate network delay
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }

            SwingUtilities.invokeLater(() -> {
                // Switch to success panel
                getContentPane().removeAll();
                getContentPane().add(createMainPanelWithSuccess());
                revalidate();
                repaint();
            });
        });
    }

    private JPanel createMainPanelWithSuccess() {
        JPanel mainPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

                GradientPaint gradient = new GradientPaint(0, 0, Color.WHITE,
                                                          getWidth(), getHeight(),
                                                          LIGHT_GRAY);
                g2d.setPaint(gradient);
                g2d.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        mainPanel.setLayout(new BorderLayout());
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));
        mainPanel.add(successPanel, BorderLayout.CENTER);
        return mainPanel;
    }

    private void handleCancel(ActionEvent e) {
        dispose();
    }
}